import { TradeHistoryService } from '../interfaces/trade-history-service.interface';
import { TradeHistory } from '../../models/trade-history';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';
import { CONTAINER_NAMES } from '../../constants';
import { AccountOrderV5 } from 'bybit-api';

type OrdersWithId = AccountOrderV5 & { id: string };

/**
 * Bybit-specific implementation of the TradeHistoryService
 */
export class BybitTradeHistoryService implements TradeHistoryService {
  constructor(private readonly ordersDbService: CosmosDbService) {}

  /**
   * Saves orders to the database
   * @param symbol The trading pair symbol
   * @param orders The orders to save
   * @returns A promise that resolves with the saved orders
   */
  public async saveOrders(symbol: string, orders: OrdersWithId[]): Promise<OrdersWithId[]> {
    try {
      if (orders.length === 0) {
        logger.info('No Bybit orders to save');
        return [];
      }

      logger.info(`Saving ${orders.length} Bybit orders for symbol ${symbol}`);

      orders.forEach((order) => (order.id = order.orderId));

      const savedOrders = await this.ordersDbService.bulkUpsertItems<OrdersWithId>(CONTAINER_NAMES.Orders, orders);

      logger.info(`Successfully saved ${savedOrders.length} Bybit orders for symbol ${symbol}`);
      return savedOrders;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save Bybit orders: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gets trade history from Bybit container in Cosmos DB
   * @param symbol Required symbol to filter trades
   * @returns Array of trade history objects
   */
  public async getTradeHistory(symbol: string): Promise<TradeHistory[]> {
    try {
      const query = 'SELECT * FROM c WHERE c.symbol = @p0 AND c.status = "FILLED" ORDER BY c.updateTime DESC';

      const results = await this.ordersDbService.queryContainer<BybitTradeRecord>(CONTAINER_NAMES.Orders, query, [
        symbol,
      ]);

      // Map Bybit-specific records to the unified TradeHistory model
      return results.map((t) => this.mapToTradeHistory(t));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to get Bybit trade history: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Maps a Bybit trade record to the unified TradeHistory model
   * @param record The Bybit trade record
   * @returns A TradeHistory object
   */
  private mapToTradeHistory(record: BybitTradeRecord): TradeHistory {
    return {
      id: record.execId,
      symbol: record.symbol,
      price: parseFloat(record.execPrice),
      quantity: parseFloat(record.execQty),
      quoteQuantity: parseFloat(record.execValue),
      time: new Date(record.execTime),
      isBuyer: record.side.toLowerCase() === 'buy',
      isMaker: record.feeRate.startsWith('-'), // Negative fee rate indicates maker (rebate)
      fee: parseFloat(record.execFee),
      feeAsset: record.feeCurrency,
      orderId: record.orderId,
      clientOrderId: record.orderLinkId,
    };
  }
}

/**
 * Interface representing the structure of Bybit trade records in Cosmos DB
 */
interface BybitTradeRecord {
  execId: string;
  symbol: string;
  execPrice: string;
  execQty: string;
  execValue: string;
  execTime: number;
  side: string;
  feeRate: string;
  execFee: string;
  feeCurrency: string;
  orderId: string;
  orderLinkId: string;
}
