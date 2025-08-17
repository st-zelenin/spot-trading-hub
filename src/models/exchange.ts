/**
 * Enum representing supported exchanges
 */
export enum ExchangeType {
  BINANCE = 'BINANCE',
  // More exchanges will be added later
}

export interface BinanceSymbolInfo {
  baseAsset: string;
  quoteAsset: string;
  stepSize: string;
  tickSize: string;
  minNotional: number;
}
