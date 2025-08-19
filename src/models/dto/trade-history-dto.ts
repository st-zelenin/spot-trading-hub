import { ExchangeType } from '../exchange';

/**
 * Request parameters for updating recent history
 */
export interface UpdateRecentHistoryRequest {
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
