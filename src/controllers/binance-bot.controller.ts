import { Body, Controller, Get, Path, Post, Put, Route, SuccessResponse, Tags } from 'tsoa';
import { ExchangeType } from '../models/exchange';
import { BinanceService } from '../services/binance/binance.service';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { ApiResponse } from '../models/dto/response-dto';
import { BotDbService } from '../services/bot/bot-db.service';
import { mongoDbService } from '../services/base-mongodb.service';
import { BinanceBotOrder, Bot, BotConfig, BotTradingPair } from '../models/dto/bot-dto';

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
    const orders = await this.botDbService.getBotOrders(botId);
    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Get configuration for a specific bot
   * @param botId The ID of the bot
   */
  @Get('{botId}')
  @SuccessResponse('200', 'Bot')
  public async getBot(@Path() botId: string): Promise<ApiResponse<Bot>> {
    const bot = await this.botDbService.getBot(botId);
    return {
      success: true,
      data: bot,
    };
  }

  /**
   * Update configuration for a specific bot
   * @param botId The ID of the bot
   * @param config The bot configuration
   */
  @Put('{botId}/config')
  @SuccessResponse('200', 'Bot configuration updated')
  public async updateBotConfig(@Path() botId: string, @Body() config: BotConfig): Promise<ApiResponse<null>> {
    await this.botDbService.updateBotConfig(botId, config);
    return {
      success: true,
      data: null,
    };
  }

  /**
   * Update trading pairs for a specific bot
   * @param botId The ID of the bot
   * @param pairs The bot trading pairs
   */
  @Put('{botId}/pairs')
  @SuccessResponse('200', 'Bot pairs updated')
  public async updateBotPairs(@Path() botId: string, @Body() pairs: BotTradingPair[]): Promise<ApiResponse<null>> {
    await this.botDbService.updateBotPairs(botId, pairs);
    return {
      success: true,
      data: null,
    };
  }

  /**
   * Create configuration for a specific bot
   * @param config The bot configuration
   */
  @Post('')
  @SuccessResponse('201', 'Bot configuration created')
  public async createBot(@Body() config: BotConfig): Promise<ApiResponse<Bot>> {
    const bot = await this.botDbService.createBot(config);
    return {
      success: true,
      data: bot,
    };
  }

  /**
   * Get all bots
   */
  @Get('')
  @SuccessResponse('200', 'All bots')
  public async getAllBots(): Promise<ApiResponse<Bot[]>> {
    const bots = await this.botDbService.getAllBots();
    return {
      success: true,
      data: bots,
    };
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
    const binanceService = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;

    const order = await binanceService.getOrder(request.orderId.toString(), request.symbol);

    await this.botDbService.insertBotOrder(order, botId);

    return {
      success: true,
      data: { ...order, botId },
    };
  }
}
