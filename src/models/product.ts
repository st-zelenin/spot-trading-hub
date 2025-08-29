/**
 * Unified product model for exchange products/trading pairs
 */
export interface Product {
  currencyPair: string;
  minQuantity: number;
  minTotal: number;
  pricePrecision: number;
}
