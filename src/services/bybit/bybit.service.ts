import { RestClientV5, OrderParamsV5, AccountOrderV5 } from 'bybit-api';
import { ExchangeService } from '../interfaces/exchange-service.interface';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SymbolInfo } from '../../models/exchange';
import { Ticker } from '../../models/ticker';
import { Product } from '../../models/product';
import Decimal from 'decimal.js';
import { BaseApiError, ExchangeError, NotFoundError, ValidationError } from '../../models/errors';
import { Trader } from '../../models/dto/user-dto';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getOrderHistory(_symbol: string, _startTime: number, _chunkEndTime: number): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }

  public async getSymbolRecentFilledOrders(symbol: string): Promise<AccountOrderV5[]> {
    try {
      logger.info(`Fetching recent filled ${symbol} orders from Bybit`);

      // // Calculate startTime for 20 days ago
      // const twentyDaysAgo = new Date();
      // twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
      // const startTime = twentyDaysAgo.getTime();

      const response = await this.client.getHistoricOrders({
        category: 'spot',
        symbol,
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to fetch recent filled orders: ${response.retMsg}`);
      }

      const orders = response.result?.list || [];
      logger.info(`Fetched ${orders.length} recent filled orders from Bybit`);

      return orders.filter((order) => order.orderStatus === 'Filled');
    } catch (error) {
      throw this.getExchangeError('Failed to fetch recent filled orders', error);
    }
  }

  public async getOrder(orderId: string, symbol: string): Promise<unknown> {
    try {
      logger.info(`Fetching order ${orderId} for symbol ${symbol} from Bybit`);

      const historicOrdersResponse = await this.client.getHistoricOrders({
        category: 'spot',
        symbol,
        orderId,
      });

      if (historicOrdersResponse.retCode !== 0) {
        throw new Error(`Failed to fetch order: ${historicOrdersResponse.retMsg}`);
      }

      const historicOrders = historicOrdersResponse.result?.list || [];

      if (historicOrders.length) {
        logger.info(`Successfully fetched order ${orderId} for symbol ${symbol} (historic orders)`);
        // TODO: test and return first
        return historicOrders;
      }

      const activeOrdersResponse = await this.client.getActiveOrders({
        category: 'spot',
        symbol,
        orderId,
      });

      if (activeOrdersResponse.retCode !== 0) {
        throw new Error(`Failed to fetch order: ${activeOrdersResponse.retMsg}`);
      }

      const activeOrders = activeOrdersResponse.result?.list || [];

      if (activeOrders.length) {
        logger.info(`Successfully fetched order ${orderId} for symbol ${symbol} (active orders)`);
        // TODO: test and return first
        return activeOrders;
      }

      throw new NotFoundError(`Order ${orderId} for symbol ${symbol} not found`);
    } catch (error) {
      throw this.getExchangeError(`Failed to fetch order ${orderId}`, error);
    }
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

  public async getAllOpenOrders(): Promise<AccountOrderV5[]> {
    try {
      const response = await this.client.getActiveOrders({
        category: 'spot',
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to get open orders: ${response.retMsg}`);
      }

      return response.result?.list || [];
    } catch (error) {
      throw this.getExchangeError('Failed to get all open orders', error);
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

  public async getExchangeInfo(symbol: string): Promise<SymbolInfo> {
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

  /**
   * Gets all tickers from Bybit in a unified format
   * @param trader The trader to get tickers for
   * @returns A promise that resolves to an array of unified tickers
   */
  public async getTraderTickers(trader: Trader): Promise<Map<string, Ticker>> {
    try {
      logger.info('Fetching tickers from Bybit');
      const response = await this.client.getTickers({
        category: 'spot',
      });

      logger.info('Response from Bybit:', { retCode: response.retCode, retMsg: response.retMsg });

      return trader.bybit
        .map((s) => response.result.list.find((t) => t.symbol === s.symbol))
        .filter(Boolean)
        .reduce((map, ticker) => {
          map.set(ticker!.symbol, {
            last: parseFloat(ticker!.lastPrice),
            changePercentage: parseFloat(ticker!.price24hPcnt) * 100,
          });
          return map;
        }, new Map<string, Ticker>());
    } catch (error) {
      logger.error('Failed to fetch tickers', { error });
      throw this.getExchangeError('Failed to fetch tickers', error);
    }
  }

  /**
   * Gets all available trading products/pairs from Bybit
   * @returns A promise that resolves to an array of unified product information
   */
  public async getProducts(): Promise<Product[]> {
    try {
      logger.info('Fetching products from Bybit');

      const response = await this.client.getInstrumentsInfo({
        category: 'spot',
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to fetch products: ${response.retMsg}`);
      }

      const symbols = response.result?.list || [];

      return symbols
        .filter((symbol) => symbol.status === 'Trading')
        .map<Product>((symbol) => ({
          currencyPair: symbol.symbol,
          minQuantity: symbol.lotSizeFilter?.minOrderQty ? parseFloat(symbol.lotSizeFilter.minOrderQty) : 0,
          minTotal: symbol.lotSizeFilter?.minOrderAmt ? parseFloat(symbol.lotSizeFilter.minOrderAmt) : 0,
          pricePrecision: symbol.priceFilter?.tickSize ? parseFloat(symbol.priceFilter.tickSize) : 0,
        }));
    } catch (error) {
      throw this.getExchangeError('Failed to fetch products', error);
    }
  }

  /**
   * Gets user trades for a specific symbol
   * @param symbol The symbol to get trades for
   * @param limit The maximum number of trades to return
   * @returns A promise that resolves to the user's trades
   */
  public async getUserTrades(symbol: string, limit = 100): Promise<unknown> {
    try {
      logger.info(`Fetching user trades for symbol ${symbol} from Bybit`);

      const response = await this.client.getExecutionList({
        category: 'spot',
        symbol,
        limit,
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to fetch user trades: ${response.retMsg}`);
      }

      logger.info(`Successfully fetched ${response.result?.list?.length || 0} user trades for symbol ${symbol}`);
      return response.result?.list || [];
    } catch (error) {
      throw this.getExchangeError(`Failed to fetch user trades for ${symbol}`, error);
    }
  }

  private getExchangeError(baseMessage: string, error: unknown): ExchangeError {
    if (error instanceof BaseApiError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ExchangeError(`${baseMessage}: ${errorMessage}`);
  }
}
