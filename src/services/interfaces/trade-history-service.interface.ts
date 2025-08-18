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
}
