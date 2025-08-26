import WebSocket, { WebSocketServer } from 'ws';
import Bottleneck from 'bottleneck';
import { ExchangeFactory } from './services/exchange-factory.service';
import { ExchangeType } from './models/exchange';
import { BinanceService } from './services/binance/binance.service';
import { logger } from './utils/logger';
import { mongoDbService } from './services/base-mongodb.service';
import { BotDbService } from './services/bot/bot-db.service';

export const startBinanceWssServer = (port: number): void => {
  const wss = new WebSocketServer({
    port,
    // host: '0.0.0.0',
    // clientTracking: true,
  });

  wss.on('error', (error) => {
    logger.error(`WebSocket server error: ${error.message}`);
  });

  logger.info(`WebSocket server started on ws://0.0.0.0:${port}`);

  const clients = new Map<string, { symbol: string; ws: WebSocket }>();
  const binance = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;
  const traidingPairs = ['ZKUSDC', 'STRKUSDC', 'PYTHUSDC', 'APTUSDC'];
  // const traidingPairs = ['ZKUSDC', 'STRKUSDC', 'PYTHUSDC', 'ZROUSDC', 'APTUSDC'];
  const botDbService = new BotDbService(mongoDbService);

  const limiter = new Bottleneck({
    minTime: 200, // 5 requests/sec max
    maxConcurrent: 1,
  });

  const messagesHandler = new WebSocketMessagesHandler(botDbService, binance, limiter, clients);

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
        const openOrders = orders.filter((o) => o.symbol === symbol);
        const currentPrice = prices.find((p) => p.symbol === symbol)?.price;

        logger.info(`Sending open orders and current price to ${botId}`, { openOrders, currentPrice });

        ws.send(JSON.stringify({ type: 'openOrdersAndCurrentPrice', data: { openOrders, currentPrice } }));
      }
    } catch (err: unknown) {
      logger.error('Price fetch error', { err });
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

        const data = payload.data as { botId: string; symbol: string };

        botId = data.botId;
        clients.set(botId, { symbol: data.symbol, ws });
        logger.info('Registered bot', { botId, symbol: data.symbol });
      }

      if (payload.type === 'filledOrderDetails') {
        logger.info('Fetching order details', payload.data);

        const { botId, symbol, ids } = payload.data as { botId: string; symbol: string; ids: number[] };
        void messagesHandler.handleFilledOrderDetails(botId, symbol, ids);
      }
    });

    ws.on('close', () => {
      if (botId) {
        clients.delete(botId);
      }
    });
  });
};

export class WebSocketMessagesHandler {
  constructor(
    private readonly botDbService: BotDbService,
    private readonly binanceService: BinanceService,
    private readonly limiter: Bottleneck,
    private readonly clients: Map<string, { symbol: string; ws: WebSocket }>
  ) {}

  public async handleFilledOrderDetails(botId: string, symbol: string, ids: number[]): Promise<void> {
    try {
      const bot = await this.botDbService.getBot(botId);
      const uniqueOrderIds = [...new Set([...bot.orderPendingDetails, ...ids])];
      const { orderPendingDetails } = await this.botDbService.updateBot(botId, { orderPendingDetails: uniqueOrderIds });

      logger.info('Updated bot order pending details', { botId, orderPendingDetails });

      (ids || []).forEach((id: number) => {
        void this.limiter.schedule(async () => {
          try {
            const order = await this.binanceService.getOrder(id.toString(), symbol);
            logger.info('Fetched order details', { order });

            await this.botDbService.insertBotOrder(order, botId);
            logger.info('Inserted order details', { orderId: id });

            await this.removeFromOrdersPendingDetails(botId, id);
            logger.info('Removed order from orders pending details', { orderId: id });

            const { ws } = this.clients.get(botId)!;
            ws.send(JSON.stringify({ type: 'filledOrderDetails', data: order }));
          } catch (err: unknown) {
            logger.error('Order fetch error', { err });
          }
        });
      });
    } catch (err: unknown) {
      logger.error('handleFilledOrderDetails error', { err });
    }
  }

  public async removeFromOrdersPendingDetails(botId: string, orderId: number): Promise<void> {
    try {
      const bot = await this.botDbService.getBot(botId);
      const orderPendingDetails = bot.orderPendingDetails.filter((id) => id !== orderId);
      await this.botDbService.updateBot(botId, { orderPendingDetails });
    } catch (err: unknown) {
      logger.error('Failed to remove order from orders pending details', { err });
    }
  }
}
