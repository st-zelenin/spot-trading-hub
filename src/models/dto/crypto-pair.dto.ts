import { ExchangeType } from '../exchange';

/**
 * Represents a cryptocurrency trading pair
 */
export interface CryptoPair {
  /**
   * The symbol of the trading pair (e.g., 'BTCUSDT')
   */
  symbol: string;
  /**
   * Indicates whether this pair is archived by the user
   */
  isArchived: boolean;
}

/**
 * Request payload for ordering cryptocurrency pairs
 */
export interface OrderedSymbols {
  /**
   * The exchange for which the symbols are being ordered
   */
  exchange: ExchangeType;
  /**
   * The ordered list of symbols
   */
  symbols: string[];
}
