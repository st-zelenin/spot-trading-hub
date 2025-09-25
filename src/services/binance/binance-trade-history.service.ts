import { TradeHistoryService } from '../interfaces/trade-history-service.interface';
import { TradeHistory } from '../../models/trade-history';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';
import { CONTAINER_NAMES } from '../../constants';
import { SpotRestAPI } from '@binance/spot';

type OrdersWithId = SpotRestAPI.AllOrdersResponse[number] & { id: string };

/**
 * Binance-specific implementation of the TradeHistoryService
 */
export class BinanceTradeHistoryService implements TradeHistoryService {
  constructor(private readonly ordersDbService: CosmosDbService) {}

  /**
   * Saves orders to the database
   * @param symbol The trading pair symbol
   * @param orders The orders to save
   * @returns A promise that resolves to the saved orders
   */
  public async saveOrders(symbol: string, orders: OrdersWithId[]): Promise<OrdersWithId[]> {
    try {
      if (!orders.length) {
        logger.info('No Binance orders to save');
        return [];
      }

      logger.info(`Saving ${orders.length} Binance orders for symbol ${symbol}`);

      orders.forEach((order) => (order.id = String(order.orderId!)));

      const savedOrders = await this.ordersDbService.bulkUpsertItems<OrdersWithId>(CONTAINER_NAMES.Orders, orders);

      logger.info(`Successfully saved ${savedOrders.length} Binance orders for symbol ${symbol}`);
      return savedOrders;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save Binance orders: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gets trade history from Binance container in Cosmos DB
   * @param symbol Required symbol to filter trades
   * @returns Array of trade history objects
   */
  public async getTradeHistory(symbol: string): Promise<TradeHistory[]> {
    try {
      const query = 'SELECT * FROM c WHERE c.symbol = @p0 AND c.status = "FILLED" ORDER BY c.updateTime DESC';

      // Query the Binance container
      const results = await this.ordersDbService.queryContainer<BinanceTradeRecord>(CONTAINER_NAMES.Orders, query, [
        symbol,
      ]);

      // Map Binance-specific records to the unified TradeHistory model
      return results.map((t) => this.mapToTradeHistory(t));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to get Binance trade history: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Maps a Binance trade record to the unified TradeHistory model
   * @param record The Binance trade record
   * @returns A TradeHistory object
   */
  private mapToTradeHistory(record: BinanceTradeRecord): TradeHistory {
    return {
      id: record.id,
      symbol: record.symbol,
      price: record.price,
      quantity: record.qty,
      quoteQuantity: record.quoteQty,
      time: new Date(record.time),
      isBuyer: record.isBuyer,
      isMaker: record.isMaker,
      fee: record.commission,
      feeAsset: record.commissionAsset,
      orderId: record.orderId,
      clientOrderId: record.clientOrderId,
    };
  }
}

/**
 * Interface representing the structure of Binance trade records in Cosmos DB
 */
interface BinanceTradeRecord {
  id: string;
  symbol: string;
  price: number;
  qty: number;
  quoteQty: number;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  commission: number;
  commissionAsset: string;
  orderId: string;
  clientOrderId: string;
}
