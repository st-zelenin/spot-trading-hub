import WebSocket, { WebSocketServer } from 'ws';
import Bottleneck from 'bottleneck';
import { ExchangeFactory } from './services/exchange-factory.service';
import { ExchangeType } from './models/exchange';
import { BinanceService } from './services/binance/binance.service';
import { logger } from './utils/logger';
import { mongoDbService } from './services/base-mongodb.service';
import { BotDbService } from './services/bot/bot-db.service';

export const startBinanceWssServer = (): void => {
  const wss = new WebSocketServer({
    port: 8080,
    // host: '0.0.0.0',
    // clientTracking: true,
  });

  wss.on('error', (error) => {
    logger.error(`WebSocket server error: ${error.message}`);
  });

  logger.info('WebSocket server started on ws://0.0.0.0:8080');

  const clients = new Map<string, WebSocket>();
  const binance = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;
  const traidingPairs = ['ZKUSDC', 'STRKUSDC', 'PYTHUSDC', 'ZROUSDC', 'APTUSDC'];
  const botDbService = new BotDbService(mongoDbService);

  const limiter = new Bottleneck({
    minTime: 200, // 5 requests/sec max
    maxConcurrent: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    try {
      logger.info('Fetching prices and orders');
      logger.info('Clients count', clients.size);

      const prices = await binance.getSymbolsPrice(traidingPairs);

      logger.info(`Fetched prices: ${prices.map((p) => `${p.symbol}: ${p.price}`).join(', ')}`);

      const orders = await binance.getOpenOrders(traidingPairs);

      logger.info(`Fetched open orders: ${orders.map((o) => `${o.symbol}/${o.orderId}/${o.side}`).join(', ')}`);

      for (const [botId, ws] of clients) {
        const openOrders = orders.filter((o) => o.symbol === botId);
        const currentPrice = prices.find((p) => p.symbol === botId)?.price;

        logger.info(`Sending open orders and current price to ${botId}`, { openOrders, currentPrice });

        ws.send(JSON.stringify({ type: 'openOrdersAndCurrentPrice', data: { openOrders, currentPrice } }));
      }
    } catch (err: unknown) {
      logger.error('Price fetch error', err instanceof Error ? err.message : JSON.stringify(err));
    }
  }, 60_000);

  wss.on('connection', (ws) => {
    let botId = '';

    ws.on('message', (msg) => {
      let msgString: string;

      if (Buffer.isBuffer(msg)) {
        msgString = msg.toString('utf8');
      } else if (msg instanceof ArrayBuffer) {
        msgString = Buffer.from(msg).toString('utf8');
      } else if (Array.isArray(msg)) {
        msgString = Buffer.concat(msg).toString('utf8');
      } else {
        msgString = String(msg);
      }

      const payload = JSON.parse(msgString) as { type: string; data: unknown };

      if (payload.type === 'register') {
        logger.info('Registering bot', { botId: payload.data });

        botId = payload.data as string;
        clients.set(botId, ws);
      }

      if (payload.type === 'filledOrderDetails') {
        logger.info('Fetching order details', payload.data);

        const { botId, symbol, ids } = payload.data as { botId: string; symbol: string; ids: number[] };
        (ids || []).forEach((id: number) => {
          void limiter.schedule(async () => {
            try {
              const order = await binance.getOrder(id.toString(), symbol);
              logger.info('Fetched order details', order);

              await botDbService.insertBotOrder(order, botId);
              logger.info('Inserted order details', order);

              const ws = clients.get(botId);
              ws!.send(JSON.stringify({ type: 'filledOrderDetails', data: order }));
            } catch (err: unknown) {
              logger.error('Order fetch error', { err });
            }
          });
        });
      }
    });

    ws.on('close', () => {
      if (botId) {
        clients.delete(botId);
      }
    });
  });
};
