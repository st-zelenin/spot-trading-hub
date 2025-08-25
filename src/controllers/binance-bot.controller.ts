import { Body, Controller, Get, Path, Post, Route, SuccessResponse, Tags } from 'tsoa';
import { ExchangeType } from '../models/exchange';
import { BinanceService } from '../services/binance/binance.service';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { ApiResponse } from '../models/dto/response-dto';
import { BotDbService } from '../services/bot/bot-db.service';
import { mongoDbService } from '../services/base-mongodb.service';
import { BinanceBotOrder } from '../models/dto/bot-dto';

@Route('binance-bot')
@Tags('Binance Bot')
export class BinanceBotController extends Controller {
  private readonly botDbService = new BotDbService(mongoDbService);

  /**
   * Get all orders for a specific bot
   * @param botId The ID of the bot
   */
  @Get('{botId}/orders')
  @SuccessResponse('200', 'Bot orders')
  public async getBotOrders(@Path() botId: string): Promise<ApiResponse<BinanceBotOrder[]>> {
    try {
      const orders = await this.botDbService.getBotOrders(botId);
      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add a Binance order to the bot's orders
   * @param botId The ID of the bot
   * @param request The order request containing orderId and symbol
   */
  @Post('{botId}/order-by-id')
  @SuccessResponse('200', 'Order')
  public async addBotOrder(
    @Path() botId: string,
    @Body() request: { orderId: number; symbol: string }
  ): Promise<ApiResponse<BinanceBotOrder>> {
    try {
      const binanceService = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;

      const order = await binanceService.getOrder(request.orderId.toString(), request.symbol);

      await this.botDbService.insertBotOrder(order, botId);

      return {
        success: true,
        data: { ...order, botId },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
