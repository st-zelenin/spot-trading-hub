import { Spot, SpotRestAPI } from '@binance/spot';
import { ExchangeService } from '../interfaces/exchange-service.interface';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { BinanceSymbolInfo } from '../../models/exchange';
import Decimal from 'decimal.js';

/**
 * Binance exchange service implementation
 * Implements the ExchangeService interface for Binance exchange
 */
export class BinanceService implements ExchangeService {
  private readonly client: Spot;
  private readonly symbolInfoCache: Map<string, BinanceSymbolInfo> = new Map();

  constructor() {
    this.client = new Spot({
      configurationRestAPI: {
        apiKey: env.BINANCE_API_KEY,
        apiSecret: env.BINANCE_API_SECRET,
      },
    });
    logger.info('Binance service initialized');
  }

  public async cancelOrder(orderId: string, symbol: string): Promise<void> {
    logger.info(`Cancelling order ${orderId} for symbol ${symbol} on Binance`);

    const cancelOrderResponse = await this.client.restAPI.deleteOrder({
      symbol,
      orderId: parseInt(orderId, 10),
    });

    logger.info(
      `Order ${orderId} for symbol ${symbol} cancelled successfully with status ${cancelOrderResponse.status}`
    );
  }

  public async cancelAllOrders(symbol: string): Promise<void> {
    logger.info(`Cancelling all orders for symbol ${symbol} on Binance`);

    const cancelOrderResponse = await this.client.restAPI.deleteOpenOrders({ symbol });

    logger.info(`All orders for symbol ${symbol} cancelled successfully with status ${cancelOrderResponse.status}`);
  }

  public async placeTrailingTakeProfitLimitSellOrder(
    symbol: string,
    quantity: number,
    limitPrice: number
  ): Promise<string> {
    logger.info(`Placing trailing take profit limit sell order: quantity=${quantity}, limit price=${limitPrice}`);

    const symbolInfo = await this.getExchangeInfo(symbol);

    const orderOptions: SpotRestAPI.NewOrderRequest = {
      symbol,
      side: SpotRestAPI.NewOrderSideEnum.SELL,
      type: SpotRestAPI.NewOrderTypeEnum.TAKE_PROFIT_LIMIT,
      quantity: this.formatQuantity(quantity, symbolInfo.stepSize),
      trailingDelta: 500,
      timeInForce: SpotRestAPI.NewOrderTimeInForceEnum.GTC,
      price: this.formatPriceWithPrecision(limitPrice, symbolInfo.tickSize),
    };

    const response = await this.client.restAPI.newOrder(orderOptions);
    const order = await response.data();

    if (!order.orderId) {
      throw new Error('Order ID is undefined');
    }

    logger.info(`Placed trailing take profit limit sell order: id=${order.orderId}, status=${order.status}`);

    return order.orderId.toString();
  }

  private async getExchangeInfo(symbol: string): Promise<BinanceSymbolInfo> {
    if (this.symbolInfoCache.has(symbol)) {
      return this.symbolInfoCache.get(symbol)!;
    }

    const response = await this.client.restAPI.exchangeInfo({ symbol });
    const exchangeInfo = await response.data();

    if (!exchangeInfo.symbols?.length) {
      throw new Error(`No symbol information found for ${symbol}`);
    }

    const [symbolInfo] = exchangeInfo.symbols;
    if (!symbolInfo.baseAsset || !symbolInfo.quoteAsset) {
      throw new Error(`Invalid symbol information for ${symbol}`);
    }

    const lotSizeFilter = symbolInfo.filters?.find(({ filterType }) => filterType === 'LOT_SIZE');

    const priceFilter = symbolInfo.filters?.find(({ filterType }) => filterType === 'PRICE_FILTER');

    const notionalFilter = symbolInfo.filters?.find(({ filterType }) => filterType === 'NOTIONAL');

    if (!lotSizeFilter) {
      throw new Error(`LOT_SIZE filter not found for ${symbol}`);
    }

    if (!lotSizeFilter.stepSize) {
      throw new Error(`stepSize not found for ${symbol}`);
    }

    if (!priceFilter) {
      throw new Error(`PRICE_FILTER not found for ${symbol}`);
    }

    if (!priceFilter.tickSize) {
      throw new Error(`tickSize not found for ${symbol}`);
    }

    const { baseAsset, quoteAsset } = symbolInfo;
    const stepSize = lotSizeFilter.stepSize;
    const tickSize = priceFilter.tickSize;

    let minNotional = 10;
    if (notionalFilter?.minNotional) {
      minNotional = parseFloat(notionalFilter.minNotional);
    } else {
      logger.warn(`NOTIONAL filter not found for ${symbol}, using default minNotional=${minNotional}`);
    }

    logger.info(
      `Get exchange info: baseAsset=${baseAsset}, quoteAsset=${quoteAsset}, ` +
        `stepSize=${stepSize}, tickSize=${tickSize}, minNotional=${notionalFilter?.minNotional}`
    );

    const result: BinanceSymbolInfo = {
      baseAsset,
      quoteAsset,
      stepSize,
      tickSize,
      minNotional,
    };

    // Cache the result
    this.symbolInfoCache.set(symbol, result);

    return result;
  }

  /**
   * Format quantity according to the stepSize from LOT_SIZE filter
   * @param quantity The quantity to format
   * @param stepSize The stepSize from LOT_SIZE filter
   * @returns The formatted quantity that complies with exchange requirements
   */
  private formatQuantity(quantity: number, stepSize: string): number {
    if (!stepSize || parseFloat(stepSize) === 0) {
      throw new Error('Invalid stepSize provided');
    }

    // Calculate the step-normalized quantity
    const stepSizeDecimal = new Decimal(stepSize);
    const quantityDecimal = new Decimal(quantity);
    const remainder = quantityDecimal.modulo(stepSizeDecimal);

    // If there's a remainder, round down to the nearest step
    if (!remainder.isZero()) {
      return quantityDecimal.minus(remainder).toNumber();
    }

    return quantity;
  }

  /**
   * Format price according to the tickSize from PRICE_FILTER
   * @param price The price to format
   * @param tickSize The tickSize from PRICE_FILTER
   * @returns The formatted price that complies with exchange requirements
   */
  private formatPriceWithPrecision(price: number, tickSize: string): number {
    if (!tickSize || parseFloat(tickSize) === 0) {
      throw new Error('Invalid tickSize provided');
    }

    // Calculate the tick-normalized price
    const tickSizeDecimal = new Decimal(tickSize);
    const priceDecimal = new Decimal(price);
    const remainder = priceDecimal.modulo(tickSizeDecimal);

    // If there's a remainder, round down to the nearest tick
    if (!remainder.isZero()) {
      return priceDecimal.minus(remainder).toNumber();
    }

    return price;
  }
}
