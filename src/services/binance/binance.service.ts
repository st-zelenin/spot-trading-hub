import { Spot, SpotRestAPI } from '@binance/spot';
import { ExchangeService } from '../interfaces/exchange-service.interface';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SymbolInfo } from '../../models/exchange';
import { Ticker } from '../../models/ticker';
import { Product } from '../../models/product';
import Decimal from 'decimal.js';
import { BaseApiError, ExchangeError, ValidationError } from '../../models/errors';
import { Trader } from '../../models/dto/user-dto';

/**
 * Binance exchange service implementation
 * Implements the ExchangeService interface for Binance exchange
 */
export class BinanceService implements ExchangeService {
  private readonly client: Spot;
  private readonly symbolInfoCache: Map<string, SymbolInfo> = new Map();

  constructor() {
    if (env.TESTNET) {
      this.client = new Spot({
        configurationRestAPI: {
          apiKey: env.BINANCE_TESTNET_API_KEY,
          apiSecret: env.BINANCE_TESTNET_API_SECRET,
          basePath: 'https://testnet.binance.vision',
        },
      });

      logger.info('Binance service initialized in TESTNET mode');
    } else {
      this.client = new Spot({
        configurationRestAPI: {
          apiKey: env.BINANCE_API_KEY,
          apiSecret: env.BINANCE_API_SECRET,
          basePath: 'https://api.binance.com',
        },
      });

      logger.info('Binance service initialized in LIVE mode');
    }
  }

  public async getSymbolRecentFilledOrders(symbol: string): Promise<SpotRestAPI.AllOrdersResponse> {
    try {
      logger.info(`Fetching recent filled ${symbol} orders from Binance`);

      const response = await this.client.restAPI.allOrders({ symbol });

      const orders = await response.data();
      logger.info(`Fetched ${orders.length} recent filled orders from Binance`);

      return orders.filter((order) => order.status === 'FILLED');
    } catch (error) {
      throw this.getExchangeError('Failed to fetch recent filled orders', error);
    }
  }

  public async getOrder(orderId: string, symbol: string): Promise<SpotRestAPI.GetOrderResponse> {
    try {
      logger.info(`Fetching order ${orderId} for symbol ${symbol} from Binance`);

      const response = await this.client.restAPI.getOrder({
        symbol,
        orderId: parseInt(orderId, 10),
      });

      const order = await response.data();
      logger.info(`Fetched order ${orderId} for symbol ${symbol} from Binance`);

      return order;
    } catch (error) {
      throw this.getExchangeError('Failed to fetch order', error);
    }
  }

  public async cancelOrder(orderId: string, symbol: string): Promise<void> {
    try {
      logger.info(`Cancelling order ${orderId} for symbol ${symbol} on Binance`);

      const cancelOrderResponse = await this.client.restAPI.deleteOrder({
        symbol,
        orderId: parseInt(orderId, 10),
      });

      logger.info(
        `Order ${orderId} for symbol ${symbol} cancelled successfully with status ${cancelOrderResponse.status}`
      );
    } catch (error) {
      throw this.getExchangeError('Failed to cancel order', error);
    }
  }

  public async cancelAllOrders(symbol: string): Promise<void> {
    try {
      logger.info(`Cancelling all orders for symbol ${symbol} on Binance`);

      const cancelOrderResponse = await this.client.restAPI.deleteOpenOrders({ symbol });

      logger.info(`All orders for symbol ${symbol} cancelled successfully with status ${cancelOrderResponse.status}`);
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
    } catch (error) {
      throw this.getExchangeError('Failed to place trailing take profit limit sell order', error);
    }
  }

  public async getSymbolsPrice(symbols: string[]): Promise<{ symbol: string; price: string }[]> {
    try {
      const response = await this.client.restAPI.tickerPrice({ symbols });
      const data = await response.data();
      const prices = data as { symbol: string; price: string }[];

      return prices;
    } catch (error) {
      throw this.getExchangeError('Failed to get symbols price', error);
    }
  }

  public async getOpenOrders(symbols: string[]): Promise<SpotRestAPI.GetOpenOrdersResponse> {
    try {
      const response = await this.client.restAPI.getOpenOrders();
      const data = await response.data();
      return data.filter((order) => symbols.includes(order.symbol!));
    } catch (error) {
      throw this.getExchangeError('Failed to get open orders', error);
    }
  }

  public async getAllOpenOrders(): Promise<SpotRestAPI.GetOpenOrdersResponse> {
    try {
      const response = await this.client.restAPI.getOpenOrders();
      const data = await response.data();
      return data;
    } catch (error) {
      throw this.getExchangeError('Failed to get all open orders', error);
    }
  }

  private async getExchangeInfo(symbol: string): Promise<SymbolInfo> {
    try {
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
   * Format quantity according to the stepSize from LOT_SIZE filter
   * @param quantity The quantity to format
   * @param stepSize The stepSize from LOT_SIZE filter
   * @returns The formatted quantity that complies with exchange requirements
   */
  private formatQuantity(quantity: number, stepSize: string): number {
    if (!stepSize || parseFloat(stepSize) === 0) {
      throw new ValidationError(`Invalid stepSize provided: ${stepSize}`);
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
      throw new ValidationError(`Invalid tickSize provided: ${tickSize}`);
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

  /**
   * Gets all tickers from Binance in a unified format
   * @param symbols The symbols to get tickers for
   * @returns A promise that resolves to a map of unified tickers
   */
  public async getTraderTickers(trader: Trader): Promise<Map<string, Ticker>> {
    try {
      logger.info('Fetching tickers from Binance');

      const symbols = trader.binance.map((s) => s.symbol);

      logger.info('Fetching tickers for symbols:', { symbols });

      // TODO: remove later
      const notSupportedSymbols = ['CYBERUSDC', 'MAVUSDC', 'XAIUSDC'];
      // const t = await this.client.restAPI.ticker({ symbol: 'CYBERUSDC' });
      // logger.info('t', t);

      const response = await this.client.restAPI.ticker({
        symbols: symbols.filter((s) => !notSupportedSymbols.includes(s)),
      });
      const tickerData = await response.data();

      const tickers = Array.isArray(tickerData) ? tickerData : [tickerData];

      return tickers.reduce((map, ticker) => {
        map.set(ticker.symbol!, {
          last: parseFloat(ticker.lastPrice || '0'),
          changePercentage: parseFloat(ticker.priceChangePercent || '0'),
        });
        return map;
      }, new Map<string, Ticker>());
    } catch (error) {
      throw this.getExchangeError('Failed to fetch tickers', error);
    }
  }

  /**
   * Gets all available trading products/pairs from Binance
   * @returns A promise that resolves to an array of unified product information
   */
  public async getProducts(): Promise<Product[]> {
    try {
      logger.info('Fetching products from Binance');

      const response = await this.client.restAPI.exchangeInfo();
      const exchangeInfo = await response.data();

      if (!exchangeInfo.symbols) {
        throw new Error('symbols not found in exchangeInfo');
      }

      return exchangeInfo.symbols
        .filter((symbol) => symbol.status === 'TRADING')
        .map<Product>((symbol) => {
          const minNotional = symbol.filters?.find((f) => f.filterType === 'MIN_NOTIONAL');
          const lotSize = symbol.filters?.find((f) => f.filterType === 'LOT_SIZE');
          const priceFilter = symbol.filters?.find((f) => f.filterType === 'PRICE_FILTER');

          return {
            currencyPair: symbol.symbol!,
            minQuantity: lotSize?.minQty ? parseFloat(lotSize.minQty) : 0,
            minTotal: minNotional?.minNotional ? parseFloat(minNotional.minNotional) : 0,
            pricePrecision: priceFilter?.tickSize ? parseFloat(priceFilter.tickSize) : 0,
          };
        });
    } catch (error) {
      throw this.getExchangeError('Failed to fetch products', error);
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
