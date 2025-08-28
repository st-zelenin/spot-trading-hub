/**
 * Interface for exchange services following the Interface Segregation Principle
 * Each method represents a specific operation that can be performed on an exchange
 */
import { Trader } from '../../models/dto/user-dto';
import { Ticker } from '../../models/ticker';

export interface ExchangeService {
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

  // Additional methods will be added later for other CRUD operations
  // createOrder(order: Partial<Order>): Promise<OrderResponse>;
  // getOrders(symbol?: string): Promise<OrderResponse>;
}
