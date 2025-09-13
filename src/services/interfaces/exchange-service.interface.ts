/**
 * Interface for exchange services following the Interface Segregation Principle
 * Each method represents a specific operation that can be performed on an exchange
 */
import { Trader } from '../../models/dto/user-dto';
import { Ticker } from '../../models/ticker';
import { Product } from '../../models/product';
import { SymbolInfo } from '../../models/exchange';

export interface ExchangeService {
  getOrderHistory(symbol: string, startTime: number, chunkEndTime: number): Promise<unknown[]>;
  /**
   * Cancels an order on the exchange
   * @param orderId The ID of the order to cancel
   * @param symbol The trading pair symbol
   * @returns A promise that resolves to an OrderResponse
   */
  cancelOrder(orderId: string, symbol: string): Promise<void>;
  cancelAllOrders(symbol: string): Promise<void>;
  placeTrailingTakeProfitLimitSellOrder(symbol: string, quantity: number, limitPrice: number): Promise<string>;

  /**
   * Gets recent filled orders from the exchange
   * @param symbol The trading pair symbol
   * @returns A promise that resolves to an array of recent filled orders
   */
  getSymbolRecentFilledOrders(symbol: string): Promise<unknown[]>;

  /**
   * Gets order details from the exchange
   * @param orderId The ID of the order to retrieve
   * @param symbol The trading pair symbol
   * @returns A promise that resolves to the order details
   */
  getOrder(orderId: string, symbol: string): Promise<unknown>;

  /**
   * Gets all open orders from the exchange
   * @returns A promise that resolves to an array of open orders
   */
  getAllOpenOrders(): Promise<unknown[]>;

  /**
   * Gets all tickers from the exchange in a unified format
   * @param trader The trader to get tickers for
   * @returns A promise that resolves to a map of unified tickers
   */
  getTraderTickers(trader: Trader): Promise<Map<string, Ticker>>;

  /**
   * Gets all available trading products/pairs from the exchange
   * @returns A promise that resolves to an array of unified product information
   */
  getProducts(): Promise<Product[]>;

  /**
   * Gets exchange information for a specific symbol
   * @param symbol The trading pair symbol
   * @returns A promise that resolves to symbol information
   */
  getExchangeInfo(symbol: string): Promise<SymbolInfo>;

  /**
   * Gets user trades for a specific symbol
   * @param symbol The symbol to get trades for
   * @param limit The maximum number of trades to return
   * @returns A promise that resolves to the user's trades
   */
  getUserTrades(symbol: string, limit?: number): Promise<unknown>;

  // Additional methods will be added later for other CRUD operations
  // createOrder(order: Partial<Order>): Promise<OrderResponse>;
  // getOrders(symbol?: string): Promise<OrderResponse>;
}
