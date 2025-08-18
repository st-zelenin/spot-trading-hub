/**
 * Enum representing supported exchanges
 */
export enum ExchangeType {
  BINANCE = 'BINANCE',
  BYBIT = 'BYBIT',
  // More exchanges will be added later
}

export interface SymbolInfo {
  baseAsset: string;
  quoteAsset: string;
  stepSize: string;
  tickSize: string;
  minNotional: number;
}
