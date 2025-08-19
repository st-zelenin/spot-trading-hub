export interface Trader {
  id: string;
  name: string;
  gate: CryptoPair[];
  crypto: CryptoPair[];
  coinbase: CryptoPair[];
  bybit: CryptoPair[];
  binance: CryptoPair[];
}

export interface CryptoPair {
  symbol: string;
  isArchived: boolean;
}
