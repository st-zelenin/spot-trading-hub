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

/**
 * Request parameters for syncing full history
 */
export interface SyncFullHistoryRequest {
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

/**
 * Request parameters for getting user trades
 */
export interface TradeHistoryRequestDto {
  /**
   * The exchange to get trades from
   * @example "BINANCE"
   */
  readonly exchange: ExchangeType;

  /**
   * The trading pair symbol
   * @example "BTCUSDT"
   */
  readonly symbol: string;

  /**
   * The maximum number of trades to return
   * @example 100
   */
  readonly limit?: number;
}
