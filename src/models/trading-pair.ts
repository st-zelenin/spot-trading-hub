export interface TradingPair extends NewTradingPair {
  id: string;
}

export interface NewTradingPair {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  buyOrderId?: number;
  sellOrderId?: number;
}
