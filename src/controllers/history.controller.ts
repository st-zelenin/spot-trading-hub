import { Body, Controller, Post, Route, SuccessResponse, Tags, Get, Query } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { TradeHistory } from '../models/trade-history';
import { TradeHistoryFactory } from '../services/trade-history-factory.service';
import { ExchangeType } from '../models/exchange';
import { logger } from '../utils/logger';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { HistorySyncFactory } from '../services/history-sync-factory.service';
import {
  UpdateRecentHistoryRequest,
  SyncFullHistoryRequest,
  TradeHistoryRequestDto,
} from '../models/dto/trade-history-dto';
import { TradingService } from '../services/trading/trading.service';
import { tradingDbService } from '../services/trading/trading-db.service';

@Route('history')
@Tags('Trade History')
export class TradeHistoryController extends Controller {
  private readonly tradingService: TradingService;

  constructor() {
    super();
    this.tradingService = new TradingService(tradingDbService);
  }

  /**
   * Get user trades for a specific symbol
   * @param requestBody The trade history request parameters
   * @returns User trades
   */
  @Post('user-trades')
  @SuccessResponse('200', 'User trades retrieved')
  public async getUserTrades(@Body() requestBody: TradeHistoryRequestDto): Promise<ApiResponse<unknown>> {
    const { exchange, symbol, limit } = requestBody;

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const trades = await exchangeService.getUserTrades(symbol, limit);

    return {
      success: true,
      data: trades,
    };
  }

  /**
   * Get trade history for a specific exchange
   * @param exchange The exchange to get trade history from
   * @param symbol The symbol to filter trades
   * @returns Trade history response
   */
  @Get('history')
  @SuccessResponse('200', 'Trade history')
  public async getTradeHistory(
    @Query() exchange: ExchangeType,
    @Query() symbol: string
  ): Promise<ApiResponse<TradeHistory[]>> {
    logger.info(`Fetching trade history for exchange: ${exchange}, symbol: ${symbol}`);

    const tradeHistoryService = TradeHistoryFactory.getTradeHistoryService(exchange);
    const tradeHistory = await tradeHistoryService.getTradeHistory(symbol);

    return {
      success: true,
      data: tradeHistory,
    };
  }

  /**
   * Fetch recent filled orders from the specified exchange and log them
   * @param exchange The exchange to fetch recent filled orders from
   * @param symbol The symbol to filter orders
   * @returns Raw recent filled orders response
   */
  @Post('recent')
  @SuccessResponse('200', 'Raw recent filled orders')
  public async updateRecentHistory(@Body() requestBody: UpdateRecentHistoryRequest): Promise<ApiResponse<unknown>> {
    const { exchange, symbol } = requestBody;

    logger.info(`Fetching recent filled orders for exchange: ${exchange}`);

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const tradeHistoryService = TradeHistoryFactory.getTradeHistoryService(exchange);

    const recentOrders = await exchangeService.getSymbolRecentFilledOrders(symbol);
    logger.info(`Successfully fetched recent filled orders for ${exchange}`);

    await tradeHistoryService.saveOrders(symbol, recentOrders);
    logger.info(`Successfully fetched and saved recent filled orders for ${exchange}`);

    return {
      success: true,
      data: recentOrders,
    };
  }

  /**
   * Sync full order history for a specific symbol from the exchange
   * @param exchange The exchange to sync full history from
   * @param symbol The symbol to filter orders
   * @param startTime Optional start time in milliseconds
   * @param endTime Optional end time in milliseconds
   * @returns Full order history response
   */
  @Post('sync-full')
  @SuccessResponse('200', 'Full order history')
  public async syncFullHistory(@Body() requestBody: SyncFullHistoryRequest): Promise<ApiResponse<unknown>> {
    const { exchange, symbol } = requestBody;

    logger.info(`Syncing full history for exchange: ${exchange}, symbol: ${symbol}`);

    const historySyncService = HistorySyncFactory.getHistorySyncService(exchange, this.tradingService);
    const fullHistory = await historySyncService.syncFullHistory(symbol);

    logger.info(`Successfully synced full history for ${exchange}, symbol: ${symbol}`);

    return {
      success: true,
      data: fullHistory,
    };
  }
}
