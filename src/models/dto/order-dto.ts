import { OrderSideV5 } from 'bybit-api';
import { ExchangeType } from '../exchange';

export interface BybitDatabaseOrderModel {
  /** by design same as orderId */
  id: string;
  orderId: string;
  symbol: string;
  orderLinkId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  avgPrice: string;
  status: 'FILLED';
  type: 'MARKET' | 'LIMIT';
  side: OrderSideV5;
  time: string;
  updateTime: string;
}

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
 * Request body for placing limit orders
 */
export interface PlaceLimitOrderRequest {
  /**
   * The side of the order (buy or sell)
   * @example "buy"
   */
  readonly side: 'buy' | 'sell';

  /**
   * The price for the order
   * @example 100000.01
   */
  readonly price: number;

  /**
   * The amount/quantity to trade
   * @example 0.01
   */
  readonly quantity: number;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;
}

/**
 * Request body for placing market orders
 */
export interface PlaceMarketOrderRequest {
  /**
   * The side of the order (buy or sell)
   * @example "buy"
   */
  readonly side: 'buy' | 'sell';

  /**
   * The total value of the order (quote quantity)
   * @example 100
   */
  readonly total: number;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;
}
