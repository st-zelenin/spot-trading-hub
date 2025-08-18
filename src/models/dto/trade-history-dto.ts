import { ExchangeType } from '../exchange';

/**
 * Request parameters for getting trade history
 */
export interface GetTradeHistoryRequest {
  /**
   * The exchange to get trade history from
   * @example "BINANCE"
   */
  readonly exchange: ExchangeType;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;
}
