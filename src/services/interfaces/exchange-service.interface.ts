/**
 * Interface for exchange services following the Interface Segregation Principle
 * Each method represents a specific operation that can be performed on an exchange
 */
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

  // Additional methods will be added later for other CRUD operations
  // createOrder(order: Partial<Order>): Promise<OrderResponse>;
  // getOrder(orderId: string, symbol: string): Promise<OrderResponse>;
  // getOrders(symbol?: string): Promise<OrderResponse>;
}
