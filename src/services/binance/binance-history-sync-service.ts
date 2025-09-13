import { ExchangeService } from '../interfaces/exchange-service.interface';
import { HistorySyncService } from '../interfaces/history-sync-service.interface';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';
import { TradingService } from '../trading/trading.service';

export class BinanceHistorySyncService implements HistorySyncService {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly tradingService: TradingService,
    private readonly ordersDbService: CosmosDbService
  ) {
    console.log('exchangeService', this.exchangeService);
    console.log('tradingService', this.tradingService);
    console.log('ordersDbService', this.ordersDbService);
  }

  public syncRecentSymbolHistory(symbol: string): Promise<void> {
    logger.info(`Sync recent history for symbol ${symbol}`);

    throw new Error('Method not implemented.');
  }

  public async syncRecentHistory(): Promise<void> {
    logger.info('Sync recent history for all symbols');

    const user = await this.tradingService.getUser();

    for (const { symbol } of user.binance) {
      logger.info(`Sync recent history for symbol ${symbol}`);
      await this.syncRecentSymbolHistory(symbol);
    }

    throw new Error('Method not implemented.');
  }

  public async syncFullHistory(symbol: string): Promise<unknown[]> {
    logger.info(`Sync full history for symbol ${symbol}`);

    const allOrders = [];
    // Binance API has a 24-hour time window limitation for allOrders endpoint
    const CHUNK_SIZE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Start from 3 years ago
    let startTime = Date.now() - 3 * 365 * 24 * 60 * 60 * 1000;
    // 10 days
    // let startTime = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const endTime = Date.now();

    // Calculate total number of chunks for progress tracking
    const totalChunks = Math.ceil((endTime - startTime) / CHUNK_SIZE);
    let chunkCounter = 0;

    while (startTime < endTime) {
      const chunkEndTime = Math.min(startTime + CHUNK_SIZE, endTime);

      // Log progress with human-readable dates and progress counter
      chunkCounter++;
      logger.info(`Fetching orders for ${symbol} [${chunkCounter}/${totalChunks}]:`, {
        from: new Date(startTime).toISOString(),
        to: new Date(chunkEndTime).toISOString(),
      });

      try {
        const orders = await this.exchangeService.getOrderHistory(symbol, startTime, chunkEndTime);
        allOrders.push(...orders);

        // Log the number of orders found in this chunk
        logger.info(`Found ${orders.length} orders for ${symbol} in this time window`);

        // Move to next time window
        startTime = chunkEndTime + 1;

        // No need for setTimeout as we're using bottleneck in the exchange service
      } catch (error) {
        // Log the error
        logger.error(`Error fetching orders for ${symbol} in time range:`, {
          from: new Date(startTime).toISOString(),
          to: new Date(chunkEndTime).toISOString(),
          error,
        });

        // Exit on error - do not proceed with history sync as data won't be complete
        throw new Error(`Failed to sync full history for ${symbol}. Data would be incomplete.`);
      }
    }

    logger.info(`Completed sync for ${symbol}. Total orders collected: ${allOrders.length}`);
    return allOrders;
  }
}
