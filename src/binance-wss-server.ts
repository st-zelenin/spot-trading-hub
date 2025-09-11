import WebSocket, { WebSocketServer } from 'ws';
import Bottleneck from 'bottleneck';
import { ExchangeFactory } from './services/exchange-factory.service';
import { ExchangeType } from './models/exchange';
import { BinanceService } from './services/binance/binance.service';
import { logger } from './utils/logger';
import { mongoDbService } from './services/base-mongodb.service';
import { BotDbService } from './services/bot/bot-db.service';

export const startBinanceWssServer = (port: number): void => {
  const wss = new WebSocketServer({ port });

  wss.on('error', (error) => logger.error(`WebSocket server error: ${error.message}`));

  logger.info(`WebSocket server started on ws://0.0.0.0:${port}`);

  const clients = new Map<string, { symbol: string; ws: WebSocket }>();
  const binance = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;
  const traidingPairs = [
    'ZKUSDC',
    'STRKUSDC',
    'PYTHUSDC',
    'ZROUSDC',
    'APTUSDC',
    'WUSDC',
    'REDUSDC',
    'BTCUSDC',
    'ETHUSDC',
    'LINEAUSDC',
  ];
  const botDbService = new BotDbService(mongoDbService);

  const limiter = new Bottleneck({
    minTime: 200, // 5 requests/sec max
    maxConcurrent: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    try {
      logger.info('Fetching prices and orders');
      logger.info(`Active clients: ${clients.size}`);

      const prices = await binance.getSymbolsPrice(traidingPairs);

      logger.info(`Fetched prices: ${prices.map((p) => `${p.symbol}: ${p.price}`).join(', ')}`);

      const orders = await binance.getOpenOrders(traidingPairs);

      logger.info(`Fetched open orders: ${orders.map((o) => `${o.symbol}/${o.orderId}/${o.side}`).join(', ')}`);

      for (const [botId, { ws, symbol }] of clients) {
        if (!traidingPairs.includes(symbol)) {
          logger.warn(`Symbol ${symbol} is not in the traiding pairs list`, { traidingPairs });
          continue;
        }

        const openOrders = orders.filter((o) => o.symbol === symbol);
        const currentPrice = prices.find((p) => p.symbol === symbol)?.price;

        logger.info(`Sending open orders and current price to ${botId}`, { openOrders, currentPrice });

        ws.send(JSON.stringify({ type: 'openOrdersAndCurrentPrice', data: { openOrders, currentPrice } }));
      }
    } catch (err: unknown) {
      logger.error('Price fetch error', { err });
    }
  }, 60_000);

  // Start the filled orders processor
  startFilledOrdersProcessor(botDbService, binance, limiter, clients);

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

        const data = payload.data as { botId: string; symbol: string };

        botId = data.botId;
        clients.set(botId, { symbol: data.symbol, ws });
        logger.info('Registered bot', { botId, symbol: data.symbol });

        if (!traidingPairs.includes(data.symbol)) {
          logger.warn(`Symbol ${data.symbol} is not in the traiding pairs list`, { traidingPairs });
        }
      }

      if (payload.type === 'filledOrderDetails') {
        logger.info('Fetching order details', payload.data);

        const { botId, symbol, ids } = payload.data as { botId: string; symbol: string; ids: number[] };
        void handleFilledOrderDetails(botId, symbol, ids, botDbService);
      }
    });

    ws.on('close', () => {
      if (botId) {
        clients.delete(botId);
      }
    });
  });
};

/**
 * Start the interval-based processor for filled orders queue
 */
export const startFilledOrdersProcessor = (
  botDbService: BotDbService,
  binanceService: BinanceService,
  limiter: Bottleneck,
  clients: Map<string, { symbol: string; ws: WebSocket }>
): void => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    try {
      const unprocessedItems = await botDbService.getUnprocessedFilledOrders(10);
      if (!unprocessedItems.length) {
        return;
      }

      logger.info(`Processing ${unprocessedItems.length} filled orders from queue`);

      for (const item of unprocessedItems) {
        void limiter.schedule(async () => {
          try {
            const order = await binanceService.getOrder(item.orderId.toString(), item.symbol);
            logger.info('Fetched order details', { order });

            await botDbService.insertBotOrder(order, item.botId);

            await botDbService.markFilledOrderAsProcessed(item.botId, item.orderId);

            const client = clients.get(item.botId);
            if (client) {
              client.ws.send(JSON.stringify({ type: 'filledOrderDetails', data: order }));
            }
          } catch (err: unknown) {
            logger.error('Failed to process filled order', {
              botId: item.botId,
              orderId: item.orderId,
              symbol: item.symbol,
              error: err,
            });
          }
        });
      }

      // Clean up processed items older than 7 days
      void botDbService.cleanupProcessedFilledOrders(7 * 24 * 60 * 60 * 1000);
    } catch (err: unknown) {
      logger.error('Error in filled orders processor', { err });
    }
  }, 5_000);
};

async function handleFilledOrderDetails(
  botId: string,
  symbol: string,
  ids: number[],
  botDbService: BotDbService
): Promise<void> {
  try {
    const queueItems = ids.map((orderId) => ({
      botId,
      orderId,
      symbol,
    }));

    await botDbService.insertFilledOrdersQueue(queueItems);

    logger.info('Added filled orders to processing queue', { queueItems });
  } catch (err: unknown) {
    logger.error('handleFilledOrderDetails error', { err });
  }
}
