import { Body, Controller, Post, Route, SuccessResponse, Tags, Get, Query } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { TradeHistory } from '../models/trade-history';
import { TradeHistoryFactory } from '../services/trade-history-factory.service';
import { ExchangeType } from '../models/exchange';
import { logger } from '../utils/logger';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { UpdateRecentHistoryRequest } from '../models/dto/trade-history-dto';

@Route('history')
@Tags('Trade History')
export class TradeHistoryController extends Controller {
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

    const recentOrders = await exchangeService.getSymbolRecentFilledOrders(symbol);

    // TODO: In the future, these orders will be saved to the database by tradeHistoryService
    logger.info(`Successfully fetched recent filled orders for ${exchange}`);

    return {
      success: true,
      data: recentOrders,
    };
  }
}
