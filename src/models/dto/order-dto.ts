import { ExchangeType } from '../exchange';

/**
 * Request body for cancelling an order
 */
export interface CancelOrderRequest {
  /**
   * The exchange to cancel the order on
   * @example "BINANCE"
   */
  readonly exchange: ExchangeType;

  /**
   * The ID of the order to cancel
   * @example "12345"
   */
  readonly orderId: string;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;
}

/**
 * Request body for cancelling all orders for a symbol
 */
export interface CancelAllOrdersRequest {
  /**
   * The exchange to cancel the orders on
   * @example "BINANCE"
   */
  readonly exchange: ExchangeType;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;
}

/**
 * Request body for placing a trailing take profit limit sell order
 */
export interface TrailingTakeProfitLimitSellOrderRequest {
  /**
   * The exchange to place the order on
   * @example "BINANCE"
   */
  readonly exchange: ExchangeType;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;

  /**
   * The quantity to sell
   * @example 0.01
   */
  readonly quantity: number;

  /**
   * The limit price for the order
   * @example 50000
   */
  readonly limitPrice: number;
}

/**
 * Additional order-related DTOs will be added here
 */
