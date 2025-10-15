import { RestClientV5, OrderParamsV5, AccountOrderV5, ExecutionV5 } from 'bybit-api';
import { ExchangeService } from '../interfaces/exchange-service.interface';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SymbolInfo } from '../../models/exchange';
import { Ticker } from '../../models/ticker';
import { Product } from '../../models/product';
import Decimal from 'decimal.js';
import { BaseApiError, ExchangeError, NotFoundError, ValidationError } from '../../models/errors';
import { Trader } from '../../models/dto/user-dto';
import { BybitDatabaseOrderModel } from '../../models/dto/order-dto';
import Bottleneck from 'bottleneck';

/**
 * Bybit exchange service implementation
 * Implements the ExchangeService interface for Bybit exchange
 */
export class BybitService implements ExchangeService {
  private readonly client: RestClientV5;
  private readonly symbolInfoCache: Map<string, SymbolInfo> = new Map();
  private readonly limiter: Bottleneck;

  constructor() {
    // Default settings: 120 requests per minute = 2 requests per second
    this.limiter = new Bottleneck({
      maxConcurrent: 5, // Maximum number of requests running at the same time
      minTime: 500, // Minimum time between requests (in ms) - 2 requests per second
      reservoir: 120, // Initial number of requests that can be made
      reservoirRefreshAmount: 120, // Number of requests that will be added to the reservoir
      reservoirRefreshInterval: 60 * 1000, // How often the reservoir will be refreshed (1 minute)
    });

    // Add retry mechanism for failed requests
    this.limiter.on('failed', (error, jobInfo) => {
      const maxRetries = 3;
      if (jobInfo.retryCount < maxRetries) {
        // Exponential backoff: 1000ms, 2000ms, 4000ms
        const retryDelay = 1000 * Math.pow(2, jobInfo.retryCount);
        logger.warn(`Retrying failed request (${jobInfo.retryCount + 1}/${maxRetries}):`, { error });
        return retryDelay;
      }
      logger.error(`Request failed after ${maxRetries} retries: `, { error });
      return null; // Stop retrying
    });

    this.client = new RestClientV5({
      key: env.BYBIT_API_KEY,
      secret: env.BYBIT_API_SECRET,
    });
    logger.info('Bybit service initialized with rate limiting');
  }

  public async getOrderHistory(symbol: string, startTime: number, endTime: number): Promise<BybitDatabaseOrderModel[]> {
    try {
      logger.info(`Fetching order history for ${symbol}`, {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
      });

      // Simple wrapper around fetchOrderHistoryChunk
      // Chunking responsibility is handled by the calling service (e.g., syncFullHistory)
      return await this.fetchOrderHistoryChunk(symbol, startTime, endTime);
    } catch (error) {
      throw this.getExchangeError(`Failed to fetch order history for ${symbol}`, error);
    }
  }

  private async fetchOrderHistoryChunk(
    symbol: string,
    startTime?: number,
    endTime?: number
  ): Promise<BybitDatabaseOrderModel[]> {
    const logContext =
      startTime && endTime
        ? {
            start: new Date(startTime).toISOString(),
            end: new Date(endTime).toISOString(),
          }
        : { timeRange: 'recent orders only' };

    logger.info(`Fetching order history chunk for ${symbol}`, logContext);

    // 1) Get filled orders from Order History
    const orderHistoryParams: {
      category: 'spot';
      symbol: string;
      startTime?: number;
      endTime?: number;
    } = {
      category: 'spot',
      symbol,
    };

    if (startTime && endTime) {
      orderHistoryParams.startTime = startTime;
      orderHistoryParams.endTime = endTime;
    }

    const orderHistoryResponse = await this.executeWithRateLimit(() =>
      this.client.getHistoricOrders(orderHistoryParams)
    );

    if (orderHistoryResponse.retCode !== 0) {
      throw new Error(`Failed to fetch order history: ${orderHistoryResponse.retMsg}`);
    }

    const orderHistoryList = orderHistoryResponse.result?.list || [];
    const filledFromOrderHistory = orderHistoryList.filter((order) => order.orderStatus === 'Filled');

    // 2) Get executions from Trade History to find any missing filled orders
    const tradeHistoryParams: {
      category: 'spot';
      symbol: string;
      startTime?: number;
      endTime?: number;
    } = {
      category: 'spot',
      symbol,
    };

    if (startTime && endTime) {
      tradeHistoryParams.startTime = startTime;
      tradeHistoryParams.endTime = endTime;
    }

    const tradeHistoryResponse = await this.executeWithRateLimit(() =>
      this.client.getExecutionList(tradeHistoryParams)
    );

    if (tradeHistoryResponse.retCode !== 0) {
      throw new Error(`Failed to fetch trade history: ${tradeHistoryResponse.retMsg}`);
    }

    const executions = tradeHistoryResponse.result?.list || [];
    const executionOrderIds = new Set<string>();
    for (const exec of executions as Array<{ orderId?: string }>) {
      if (exec.orderId) executionOrderIds.add(exec.orderId);
    }

    // 3) Find order IDs that exist in trade history but not in order history
    const orderHistoryIds = new Set(filledFromOrderHistory.map((o) => o.orderId));
    const missingOrderIds = Array.from(executionOrderIds).filter((id) => !orderHistoryIds.has(id));

    // 4) Reconstruct missing orders from trade executions
    const reconstructedOrders: BybitDatabaseOrderModel[] = [];

    for (const orderId of missingOrderIds) {
      // Find all executions for this order
      const orderExecutions = executions.filter((exec: ExecutionV5) => exec.orderId === orderId);
      if (orderExecutions.length > 0) {
        const dbModel = this.mapExecutionsToBybitOrder(orderExecutions, orderId);
        reconstructedOrders.push(dbModel);
        logger.debug(`Reconstructed order from ${orderExecutions.length} executions`, { orderId });
      }
    }

    // 5) Convert order history to BybitOrderV5 format and combine with reconstructed orders
    const convertedOrderHistory = filledFromOrderHistory.map((order) => this.mapAccountOrderToFilledBybitOrder(order));
    const allFilledOrders = [...convertedOrderHistory, ...reconstructedOrders];
    const deduped = new Map<string, BybitDatabaseOrderModel>();
    for (const order of allFilledOrders) {
      deduped.set(order.orderId, order);
    }

    const result = Array.from(deduped.values());
    logger.info(
      `Fetched ${result.length} orders for ${symbol} in time chunk (${filledFromOrderHistory.length} from order history + ${reconstructedOrders.length} reconstructed)`
    );

    return result;
  }

  public async getSymbolRecentFilledOrders(symbol: string): Promise<BybitDatabaseOrderModel[]> {
    try {
      logger.info(`Fetching recent filled ${symbol} orders from Bybit`);

      const result = await this.fetchOrderHistoryChunk(symbol);

      logger.info(`Fetched ${result.length} recent filled orders from Bybit (combined Order History + Trade History)`);
      return result;
    } catch (error) {
      throw this.getExchangeError('Failed to fetch recent filled orders', error);
    }
  }

  public async getOrder(orderId: string, symbol: string): Promise<unknown> {
    try {
      logger.info(`Fetching order ${orderId} for symbol ${symbol} from Bybit`);

      const historicOrdersResponse = await this.executeWithRateLimit(() =>
        this.client.getHistoricOrders({
          category: 'spot',
          symbol,
          orderId,
        })
      );

      if (historicOrdersResponse.retCode !== 0) {
        throw new Error(`Failed to fetch order: ${historicOrdersResponse.retMsg}`);
      }

      const historicOrders = historicOrdersResponse.result?.list || [];

      if (historicOrders.length) {
        logger.info(`Successfully fetched order ${orderId} for symbol ${symbol} (historic orders)`);
        return historicOrders;
      }

      const activeOrdersResponse = await this.executeWithRateLimit(() =>
        this.client.getActiveOrders({
          category: 'spot',
          symbol,
          orderId,
        })
      );

      if (activeOrdersResponse.retCode !== 0) {
        throw new Error(`Failed to fetch order: ${activeOrdersResponse.retMsg}`);
      }

      const activeOrders = activeOrdersResponse.result?.list || [];

      if (activeOrders.length) {
        logger.info(`Successfully fetched order ${orderId} for symbol ${symbol} (active orders)`);
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

  public async getAllOpenOrders(): Promise<BybitDatabaseOrderModel[]> {
    try {
      const response = await this.client.getActiveOrders({
        category: 'spot',
      });

      if (response.retCode !== 0) {
        throw new Error(`Failed to get open orders: ${response.retMsg}`);
      }

      const orders = response.result?.list || [];
      return orders.map((order) => this.mapAccountOrderToFilledBybitOrder(order));
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

  /**
   * Wraps API calls with the rate limiter and retry mechanism
   * @param fn The function to execute with rate limiting
   * @returns The result of the function
   */
  private async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(() => fn());
    // Errors will be handled by the 'failed' event handler for retries
    // If all retries fail, the error will be propagated automatically
  }

  private getExchangeError(baseMessage: string, error: unknown): ExchangeError {
    if (error instanceof BaseApiError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ExchangeError(`${baseMessage}: ${errorMessage}`);
  }

  private mapAccountOrderToFilledBybitOrder(order: AccountOrderV5): BybitDatabaseOrderModel {
    return {
      id: order.orderId,
      orderId: order.orderId,
      symbol: order.symbol,
      orderLinkId: order.orderLinkId,
      price: order.price,
      origQty: order.qty,
      executedQty: order.cumExecQty,
      cummulativeQuoteQty: order.cumExecValue,
      avgPrice: order.avgPrice,
      status: 'FILLED',
      type: order.orderType === 'Market' ? 'MARKET' : 'LIMIT',
      side: order.side,
      time: order.createdTime,
      updateTime: order.updatedTime,
    };
  }

  private mapExecutionsToBybitOrder(executions: ExecutionV5[], orderId: string): BybitDatabaseOrderModel {
    if (executions.length === 0) {
      throw new Error('Cannot map empty executions array to order');
    }

    const [firstExec] = executions;

    const totalQty = executions.reduce((sum, exec) => sum + parseFloat(exec.execQty), 0);
    const totalValue = executions.reduce((sum, exec) => sum + parseFloat(exec.execValue), 0);
    const avgPrice = totalValue / totalQty;

    return {
      id: orderId,
      orderId: orderId,
      symbol: firstExec.symbol,
      orderLinkId: firstExec.orderLinkId,
      price: avgPrice.toString(),
      origQty: totalQty.toString(),
      executedQty: totalQty.toString(),
      cummulativeQuoteQty: totalValue.toString(),
      avgPrice: avgPrice.toString(),
      status: 'FILLED',
      type: firstExec.orderType === 'Market' ? 'MARKET' : 'LIMIT',
      side: firstExec.side,
      time: firstExec.execTime,
      updateTime: executions[executions.length - 1].execTime,
    };
  }
}
