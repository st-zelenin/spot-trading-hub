import { Controller, Get, Path, Route, SuccessResponse, Tags } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { ExchangeType, SymbolInfo } from '../models/exchange';
import { logger } from '../utils/logger';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { Ticker } from '../models/ticker';
import { Product } from '../models/product';
import { TradingService } from '../services/trading/trading.service';
import { tradingDbService } from '../services/trading/trading-db.service';

@Route('exchange')
@Tags('Exchange')
export class ExchangeController extends Controller {
  private readonly tradingService = new TradingService(tradingDbService);

  /**
   * Get tickers from a specific exchange
   * @param exchange The exchange to get tickers from
   * @returns Unified ticker information
   */
  @Get('{exchange}/trader-tickers')
  @SuccessResponse('200', 'Tickers retrieved successfully')
  public async getTraderTickers(@Path() exchange: ExchangeType): Promise<ApiResponse<Record<string, Ticker>>> {
    logger.info(`Fetching tickers for exchange: ${exchange}`);

    const user = await this.tradingService.getUser();

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const tickers = await exchangeService.getTraderTickers(user);

    logger.info(`Successfully fetched ${Object.keys(tickers).length} tickers for ${exchange}`);

    return {
      success: true,
      data: Object.fromEntries(Array.from(tickers.entries())) as Record<string, Ticker>,
    };
  }

  /**
   * Get available trading products/pairs from a specific exchange
   * @param exchange The exchange to get products from
   * @returns Unified product information
   */
  @Get('{exchange}/products')
  @SuccessResponse('200', 'Products retrieved successfully')
  public async getProducts(@Path() exchange: ExchangeType): Promise<ApiResponse<Product[]>> {
    logger.info(`Fetching products for exchange: ${exchange}`);

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const products = await exchangeService.getProducts();

    logger.info(`Successfully fetched ${products.length} products for ${exchange}`);

    return {
      success: true,
      data: products,
    };
  }

  /**
   * Get symbol information from a specific exchange
   * @param symbol The trading pair symbol
   * @param exchange The exchange to get symbol info from
   * @returns Symbol information
   */
  @Get('{exchange}/symbol/{symbol}')
  @SuccessResponse('200', 'Symbol information retrieved successfully')
  public async getSymbolInfo(@Path() symbol: string, @Path() exchange: ExchangeType): Promise<ApiResponse<SymbolInfo>> {
    logger.info(`Fetching symbol info for ${symbol} on exchange: ${exchange}`);

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const symbolInfo = await exchangeService.getExchangeInfo(symbol);

    logger.info(`Successfully fetched symbol info for ${symbol} on ${exchange}`);

    return {
      success: true,
      data: symbolInfo,
    };
  }
}
