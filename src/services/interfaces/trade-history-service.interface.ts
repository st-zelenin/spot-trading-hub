import { TradeHistory } from '../../models/trade-history';

/**
 * Interface for trade history services
 * Each exchange implementation will query its own container and map to the unified model
 */
export interface TradeHistoryService {
  /**
   * Gets the trade history for a specific symbol
   * @param symbol The trading pair symbol (required)
   * @returns A promise that resolves to an array of TradeHistory objects
   */
  getTradeHistory(symbol: string): Promise<TradeHistory[]>;

  /**
   * Saves orders to the database
   * @param symbol The trading pair symbol
   * @param orders The orders to save
   * @returns A promise that resolves to the saved orders
   */
  saveOrders(symbol: string, orders: unknown[]): Promise<unknown[]>;
}
