/**
 * Unified trade history model for all exchanges
 */
export interface TradeHistory {
  /**
   * The ID of the trade
   */
  id: string;

  /**
   * The trading pair symbol
   */
  symbol: string;

  /**
   * The price at which the trade was executed
   */
  price: number;

  /**
   * The quantity of the trade
   */
  quantity: number;

  /**
   * The total value of the trade (price * quantity)
   */
  quoteQuantity: number;

  /**
   * The timestamp of the trade
   */
  time: Date;

  /**
   * Whether the trade was a buy or sell
   */
  isBuyer: boolean;

  /**
   * Whether the trade was a maker or taker
   */
  isMaker: boolean;

  /**
   * The fee amount
   */
  fee?: number;

  /**
   * The fee asset
   */
  feeAsset?: string;

  /**
   * The order ID associated with the trade
   */
  orderId: string;

  /**
   * The client order ID associated with the trade
   */
  clientOrderId?: string;
}
