import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { TradeHistory } from '../models/trade-history';
import { TradeHistoryFactory } from '../services/trade-history-factory.service';
import { ExchangeType } from '../models/exchange';

@Route('trade-history')
@Tags('Trade History')
export class TradeHistoryController extends Controller {
  /**
   * Get trade history for a specific exchange
   * @param exchange The exchange to get trade history from
   * @param symbol The symbol to filter trades
   * @returns Trade history response
   */
  @Get('history')
  public async getTradeHistory(
    @Query() exchange: ExchangeType,
    @Query() symbol: string
  ): Promise<ApiResponse<TradeHistory[]>> {
    const tradeHistoryService = TradeHistoryFactory.getTradeHistoryService(exchange);
    const tradeHistory = await tradeHistoryService.getTradeHistory(symbol);

    return {
      success: true,
      data: tradeHistory,
    };
  }
}
