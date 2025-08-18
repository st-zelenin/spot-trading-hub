import { RestClientV5, OrderParamsV5 } from 'bybit-api';
import { ExchangeService } from '../interfaces/exchange-service.interface';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SymbolInfo } from '../../models/exchange';
import Decimal from 'decimal.js';
import { BaseApiError, ExchangeError, ValidationError } from '../../models/errors';

/**
 * Bybit exchange service implementation
 * Implements the ExchangeService interface for Bybit exchange
 */
export class BybitService implements ExchangeService {
  private readonly client: RestClientV5;
  private readonly symbolInfoCache: Map<string, SymbolInfo> = new Map();

  constructor() {
    this.client = new RestClientV5({
      key: env.BYBIT_API_KEY,
      secret: env.BYBIT_API_SECRET,
    });
    logger.info('Bybit service initialized');
  }

  public async cancelOrder(orderId: string, symbol: string): Promise<void> {
    try {
      logger.info(`Cancelling order ${orderId} for symbol ${symbol} on Bybit`);

      const cancelOrderResponse = await this.client.cancelOrder({
        symbol,
        orderId,
        category: 'spot',
      });

      if (cancelOrderResponse.retCode !== 0) {
        throw new Error(`Failed to cancel order: ${cancelOrderResponse.retMsg}`);
      }

      logger.info(`Order ${orderId} for symbol ${symbol} cancelled successfully`);
    } catch (error) {
      throw this.getExchangeError('Failed to cancel order', error);
    }
  }

  public async cancelAllOrders(symbol: string): Promise<void> {
    try {
      logger.info(`Cancelling all orders for symbol ${symbol} on Bybit`);

      const cancelOrderResponse = await this.client.cancelAllOrders({
        symbol,
        category: 'spot',
      });

      if (cancelOrderResponse.retCode !== 0) {
        throw new Error(`Failed to cancel all orders: ${cancelOrderResponse.retMsg}`);
      }

      logger.info(`All orders for symbol ${symbol} cancelled successfully`);
    } catch (error) {
      throw this.getExchangeError('Failed to cancel all orders', error);
    }
  }

  public async placeTrailingTakeProfitLimitSellOrder(
    symbol: string,
    quantity: number,
    limitPrice: number
  ): Promise<string> {
    logger.info(`Placing trailing take profit limit sell order: quantity=${quantity}, limit price=${limitPrice}`);

    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    if (limitPrice <= 0) {
      throw new ValidationError('Limit price must be greater than 0');
    }

    try {
      const symbolInfo = await this.getExchangeInfo(symbol);

      // Note: Bybit doesn't have a direct trailing take profit limit order type like Binance
      // We're using a limit order with a trailing stop as a close approximation
      const orderOptions: OrderParamsV5 = {
        category: 'spot',
        symbol,
        side: 'Sell',
        orderType: 'Limit',
        qty: this.formatQuantity(quantity, symbolInfo.stepSize),
        price: this.formatPriceWithPrecision(limitPrice, symbolInfo.tickSize),
        timeInForce: 'GTC',
        triggerDirection: 2, // 1: rise, 2: fall
        triggerPrice: this.formatPriceWithPrecision(limitPrice * 0.99, symbolInfo.tickSize), // 1% below limit price
      };

      const response = await this.client.submitOrder(orderOptions);

      if (response.retCode !== 0) {
        throw new Error(`Failed to place order: ${response.retMsg}`);
      }

      const orderId = response.result?.orderId;
      if (!orderId) {
        throw new Error('Order ID is undefined');
      }

      logger.info(`Placed trailing take profit limit sell order: id=${orderId}`);

      return orderId.toString();
    } catch (error) {
      throw this.getExchangeError('Failed to place trailing take profit limit sell order', error);
    }
  }

  private async getExchangeInfo(symbol: string): Promise<SymbolInfo> {
    try {
      if (this.symbolInfoCache.has(symbol)) {
        return this.symbolInfoCache.get(symbol)!;
      }

      const response = await this.client.getInstrumentsInfo({
        category: 'spot',
        symbol,
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to get exchange info: ${response.retMsg}`);
      }

      const symbolInfo = response.result?.list?.[0];
      if (!symbolInfo) {
        throw new Error(`No symbol information found for ${symbol}`);
      }

      if (!symbolInfo.baseCoin || !symbolInfo.quoteCoin) {
        throw new Error(`Invalid symbol information for ${symbol}`);
      }

      const baseAsset = symbolInfo.baseCoin;
      const quoteAsset = symbolInfo.quoteCoin;
      const stepSize = symbolInfo.lotSizeFilter?.basePrecision || '0.00001';
      const tickSize = symbolInfo.priceFilter?.tickSize || '0.00001';
      const minNotional = parseFloat(symbolInfo.lotSizeFilter?.minOrderAmt || '10');

      logger.info(
        `Get exchange info: baseAsset=${baseAsset}, quoteAsset=${quoteAsset}, ` +
          `stepSize=${stepSize}, tickSize=${tickSize}, minNotional=${minNotional}`
      );

      const result: SymbolInfo = {
        baseAsset,
        quoteAsset,
        stepSize,
        tickSize,
        minNotional,
      };

      // Cache the result
      this.symbolInfoCache.set(symbol, result);

      return result;
    } catch (error) {
      throw this.getExchangeError('Failed to get exchange info', error);
    }
  }

  /**
   * Format quantity according to the stepSize
   * @param quantity The quantity to format
   * @param stepSize The stepSize
   * @returns The formatted quantity that complies with exchange requirements
   */
  private formatQuantity(quantity: number, stepSize: string): string {
    if (!stepSize || parseFloat(stepSize) === 0) {
      throw new ValidationError(`Invalid stepSize provided: ${stepSize}`);
    }

    // Calculate the step-normalized quantity
    const stepSizeDecimal = new Decimal(stepSize);
    const quantityDecimal = new Decimal(quantity);
    const remainder = quantityDecimal.modulo(stepSizeDecimal);

    // If there's a remainder, round down to the nearest step
    if (!remainder.isZero()) {
      return quantityDecimal.minus(remainder).toString();
    }

    return quantity.toString();
  }

  /**
   * Format price according to the tickSize
   * @param price The price to format
   * @param tickSize The tickSize
   * @returns The formatted price that complies with exchange requirements
   */
  private formatPriceWithPrecision(price: number, tickSize: string): string {
    if (!tickSize || parseFloat(tickSize) === 0) {
      throw new ValidationError(`Invalid tickSize provided: ${tickSize}`);
    }

    // Calculate the tick-normalized price
    const tickSizeDecimal = new Decimal(tickSize);
    const priceDecimal = new Decimal(price);
    const remainder = priceDecimal.modulo(tickSizeDecimal);

    // If there's a remainder, round down to the nearest tick
    if (!remainder.isZero()) {
      return priceDecimal.minus(remainder).toString();
    }

    return price.toString();
  }

  private getExchangeError(baseMessage: string, error: unknown): ExchangeError {
    if (error instanceof BaseApiError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ExchangeError(`${baseMessage}: ${errorMessage}`);
  }
}
