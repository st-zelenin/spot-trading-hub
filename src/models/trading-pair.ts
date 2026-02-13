export interface TradingPair extends NewTradingPair {
  id: string;
}

export interface NewTradingPair {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  buyFilled: boolean;
  buyOrderId?: number;
  sellOrderId?: number;
  trailingDelta?: number;
  /** Quote amount to sell (e.g. USDT), rounded to quote precision */
  sellQuoteAmount?: number;
}
