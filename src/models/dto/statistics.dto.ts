export interface OrderStatistics {
  buyOrdersCount: number;
  sellOrdersCount: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  profitLoss: number;
}

export interface OrderStatisticsResult {
  buyStats: { count: number; total: number }[];
  sellStats: { count: number; total: number }[];
}
