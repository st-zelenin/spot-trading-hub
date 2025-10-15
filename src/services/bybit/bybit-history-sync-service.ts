import { ExchangeService } from '../interfaces/exchange-service.interface';
import { HistorySyncService } from '../interfaces/history-sync-service.interface';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';
import { TradingService } from '../trading/trading.service';

export class BybitHistorySyncService implements HistorySyncService {
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

  public syncRecentHistory(): Promise<void> {
    logger.info('Sync recent history for all symbols');

    throw new Error('Method not implemented.');
  }

  public async syncFullHistory(symbol: string): Promise<unknown[]> {
    logger.info(`Sync full history for symbol ${symbol}`);

    const allOrders = [];
    // Bybit API has a 7-day time window limitation for order history endpoints
    const CHUNK_SIZE = 6 * 24 * 60 * 60 * 1000; // 6 days in milliseconds (less than 7-day limit)

    // Start from 3 months ago
    const HISTORY_MONTHS = 3;
    let startTime = Date.now() - HISTORY_MONTHS * 30 * 24 * 60 * 60 * 1000; // 3 months ago
    const endTime = Date.now();

    const totalChunks = Math.ceil((endTime - startTime) / CHUNK_SIZE);
    let chunkCounter = 0;

    logger.info(`Starting full history sync for ${symbol} over ${HISTORY_MONTHS} months`, {
      from: new Date(startTime).toISOString(),
      to: new Date(endTime).toISOString(),
      totalChunks,
    });

    while (startTime < endTime) {
      const chunkEndTime = Math.min(startTime + CHUNK_SIZE, endTime);

      chunkCounter++;
      logger.info(`Fetching orders for ${symbol} [${chunkCounter}/${totalChunks}]:`, {
        from: new Date(startTime).toISOString(),
        to: new Date(chunkEndTime).toISOString(),
      });

      try {
        const orders = await this.exchangeService.getOrderHistory(symbol, startTime, chunkEndTime);
        allOrders.push(...orders);

        logger.info(`Found ${orders.length} orders for ${symbol} in this time window`);

        startTime = chunkEndTime + 1;
      } catch (error) {
        logger.error(`Error fetching orders for ${symbol} in time range:`, {
          from: new Date(startTime).toISOString(),
          to: new Date(chunkEndTime).toISOString(),
          error,
        });

        throw new Error(`Failed to sync full history for ${symbol}. Data would be incomplete.`);
      }
    }

    logger.info(`Completed sync for ${symbol}. Total orders collected: ${allOrders.length}`);
    return allOrders;
  }
}
