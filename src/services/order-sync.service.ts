import { ExchangeType } from '../models/exchange';
import { logger } from '../utils/logger';
import { ExchangeFactory } from './exchange-factory.service';
import { ExchangeService } from './interfaces/exchange-service.interface';
import { TradeHistoryService } from './interfaces/trade-history-service.interface';
import { TradeHistoryFactory } from './trade-history-factory.service';

/**
 * Service for synchronizing recent filled orders for a specified exchange
 */
export class OrderSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly exchangeService: ExchangeService;
  private readonly tradeHistoryService: TradeHistoryService;

  constructor(
    private readonly exchangeType: ExchangeType,
    private readonly pairs: string[]
  ) {
    this.exchangeService = ExchangeFactory.getExchangeService(exchangeType);
    this.tradeHistoryService = TradeHistoryFactory.getTradeHistoryService(exchangeType);
  }

  /**
   * Starts the periodic sync process
   */
  public startSync(): void {
    if (this.syncInterval) {
      logger.warn('Order sync is already running', { exchange: this.exchangeType });
      return;
    }

    logger.info('Starting order sync service');
    this.syncInterval = setInterval(() => {
      this.syncRecentOrders().catch((error) => {
        logger.error('Error during scheduled order sync:', { error, exchange: this.exchangeType });
      });
    }, this.SYNC_INTERVAL_MS);

    // Run initial sync
    this.syncRecentOrders().catch((error) => {
      logger.error('Error during initial order sync:', { error, exchange: this.exchangeType });
    });
  }

  /**
   * Stop the periodic sync process
   */
  public stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Order sync service stopped', { exchange: this.exchangeType });
    }
  }

  /**
   * Manually trigger a sync of recent orders
   */
  public async syncRecentOrders(): Promise<void> {
    try {
      logger.info('Starting recent orders sync', { exchange: this.exchangeType });

      let totalOrdersSynced = 0;
      for (const symbol of this.pairs) {
        try {
          await this.syncSymbolOrders(symbol);
          totalOrdersSynced++;
        } catch (error) {
          logger.error(`Failed to sync orders for symbol ${symbol}:`, { error, exchange: this.exchangeType });
        }
      }

      logger.info('Order sync completed', {
        synced: totalOrdersSynced,
        total: this.pairs.length,
      });
    } catch (error) {
      logger.error('Failed to sync orders:', { error, exchange: this.exchangeType });
      throw error;
    }
  }

  /**
   * Syncs recent filled orders for a specific symbol
   * @param symbol The trading pair symbol to sync
   */
  private async syncSymbolOrders(symbol: string): Promise<void> {
    try {
      const recentOrders = await this.exchangeService.getSymbolRecentFilledOrders(symbol);

      if (recentOrders.length === 0) {
        logger.debug(`No recent filled orders found for symbol: ${symbol}`, { exchange: this.exchangeType });
        return;
      }

      await this.tradeHistoryService.saveOrders(symbol, recentOrders);

      logger.debug(`Successfully synced ${recentOrders.length} orders for symbol: ${symbol}`, {
        exchange: this.exchangeType,
      });
    } catch (error) {
      logger.error(`Failed to sync orders for symbol ${symbol}:`, { error, exchange: this.exchangeType });
      throw error;
    }
  }

  /**
   * Gets the current sync status
   * @returns Object containing sync status information
   */
  public getSyncStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.syncInterval !== null,
      intervalMs: this.SYNC_INTERVAL_MS,
    };
  }
}
