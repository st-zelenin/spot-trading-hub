import WebSocket, { WebSocketServer } from 'ws';
import Bottleneck from 'bottleneck';
import { ExchangeFactory } from './services/exchange-factory.service';
import { ExchangeType } from './models/exchange';
import { BinanceService } from './services/binance/binance.service';
import { logger } from './utils/logger';
import { mongoDbService } from './services/base-mongodb.service';
import { BotDbService } from './services/bot/bot-db.service';
import { BotConfig, NewFilledOrderQueueItem } from './models/dto/bot-dto';

const clients = new Map<string, { symbol: string; ws: WebSocket }>();
let uiClient: WebSocket | null = null;

export const startBinanceWssServer = (port: number): void => {
  const wss = new WebSocketServer({ port });

  wss.on('error', (error) => logger.error(`WebSocket server error: ${error.message}`));

  logger.info(`WebSocket server started on ws://0.0.0.0:${port}`);

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
    'AVAXUSDC',
    'NEARUSDC',
    'LINKUSDC',
    'XRPUSDC',
    'SOLUSDC',
    'SUIUSDC',
    'ARBUSDC',
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
      const pricesMap = prices.reduce(
        (acc, p) => {
          acc[p.symbol] = p.price;
          return acc;
        },
        {} as Record<string, string>
      );

      logger.info('Fetched prices:', { pricesMap });

      uiClient?.send(JSON.stringify({ type: 'prices', data: pricesMap }));

      const orders = await binance.getOpenOrders(traidingPairs);

      logger.info(`Fetched open orders: ${orders.map((o) => `${o.symbol}/${o.orderId}/${o.side}`).join(', ')}`);

      for (const [botId, { ws, symbol }] of clients) {
        if (!traidingPairs.includes(symbol)) {
          logger.warn(`Symbol ${symbol} is not in the traiding pairs list`, { traidingPairs });
          continue;
        }

        const openOrders = orders.filter((o) => o.symbol === symbol);
        const currentPrice = pricesMap[symbol];

        logger.info(`Sending open orders and current price to ${botId}`, { openOrders, currentPrice });

        ws.send(JSON.stringify({ type: 'openOrdersAndCurrentPrice', data: { openOrders, currentPrice } }));
      }
    } catch (err: unknown) {
      logger.error('Price fetch error', { err });
    }
  }, 60_000);

  // Start the filled orders processor
  startFilledOrdersProcessor(botDbService, binance, limiter, clients);

  // Start the pending orders processor
  startPendingOrdersProcessor(botDbService, binance);

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

      if (payload.type === 'register-ui-client') {
        uiClient = ws;
        logger.info('Registered UI client');
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

/**
 * Start the interval-based processor for pending orders queue
 */
export const startPendingOrdersProcessor = (botDbService: BotDbService, binanceService: BinanceService): void => {
  setInterval(
    () => {
      void (async () => {
        try {
          const pendingItems = await botDbService.getPendingOrders(50);
          if (!pendingItems.length) {
            return;
          }

          logger.info(`Checking status of ${pendingItems.length} pending orders`);

          for (const item of pendingItems) {
            try {
              const order = await binanceService.getOrder(item.orderId.toString(), item.symbol);
              logger.info('Checked pending order status', {
                orderId: item.orderId,
                symbol: item.symbol,
                status: order.status,
              });

              // If order is filled, process it and mark as processed
              if (order.status === 'FILLED') {
                await botDbService.insertBotOrder(order, item.botId);
                await botDbService.markFilledOrderAsProcessed(item.botId, item.orderId);
                logger.info('Pending order was filled and processed', {
                  botId: item.botId,
                  orderId: item.orderId,
                });
              }
            } catch (err: unknown) {
              logger.error('Failed to check pending order status', {
                botId: item.botId,
                orderId: item.orderId,
                symbol: item.symbol,
                error: err,
              });
            }
          }
        } catch (err: unknown) {
          logger.error('Error in pending orders processor', { err });
        }
      })();
    },
    2 * 60 * 60 * 1000
  ); // 2 hours
};

async function handleFilledOrderDetails(
  botId: string,
  symbol: string,
  ids: number[],
  botDbService: BotDbService
): Promise<void> {
  try {
    const queueItems = ids.map<NewFilledOrderQueueItem>((orderId) => ({
      botId,
      orderId,
      symbol,
      type: 'filled',
    }));

    await botDbService.insertFilledOrdersQueue(queueItems);

    logger.info('Added filled orders to processing queue', { queueItems });
  } catch (err: unknown) {
    logger.error('handleFilledOrderDetails error', { err });
  }
}

export function sendConfigUpdateToBot(botId: string, config: BotConfig): void {
  const client = clients.get(botId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify({ type: 'configUpdated', data: config }));
    logger.info(`Sent config update to bot ${botId}`, { config });
  } else {
    logger.warn(`Bot ${botId} is not connected or WebSocket is not open`);
  }
}
