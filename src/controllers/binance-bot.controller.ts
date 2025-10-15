import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, SuccessResponse, Tags } from 'tsoa';
import { ExchangeType } from '../models/exchange';
import { BinanceService } from '../services/binance/binance.service';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { ApiResponse } from '../models/dto/response-dto';
import { BotDbService } from '../services/bot/bot-db.service';
import { mongoDbService } from '../services/base-mongodb.service';
import { BinanceBotOrder, Bot, BotConfig, BotTradingPair, PagedData } from '../models/dto/bot-dto';
import { OrderStatistics } from '../models/dto/statistics.dto';
import { sendConfigUpdateToBot } from '../binance-wss-server';

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
   * Get paginated orders from all bots with filtering
   * @param pageNum Page number (1-based)
   * @param pageSize Number of items per page
   * @param side Order side filter (BUY or SELL)
   */
  @Get('orders')
  @SuccessResponse('200', 'Paginated orders')
  public async getAllOrders(
    @Query() pageNum: number,
    @Query() pageSize: number,
    @Query() side: 'BUY' | 'SELL'
  ): Promise<ApiResponse<PagedData<BinanceBotOrder>>> {
    const orders = await this.botDbService.getAllOrdersPaginated(pageNum, pageSize, side);
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
  public async updateBotConfig(@Path() botId: string, @Body() config: BotConfig): Promise<ApiResponse<Bot>> {
    const data = await this.botDbService.updateBot(botId, { config });

    sendConfigUpdateToBot(botId, data.config);

    return {
      success: true,
      data,
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
    await this.botDbService.updateBot(botId, { pairs });
    return {
      success: true,
      data: null,
    };
  }

  /**
   * Update numPairs for a specific bot
   * @param botId The ID of the bot
   * @param numPairs The number of pairs
   */
  @Put('{botId}/num-pairs')
  @SuccessResponse('200', 'Bot numPairs updated')
  public async updateBotNumPairs(@Path() botId: string, @Body() body: { numPairs: number }): Promise<ApiResponse<Bot>> {
    const data = await this.botDbService.updateBot(botId, { config: { numPairs: body.numPairs } });

    sendConfigUpdateToBot(botId, data.config);

    return {
      success: true,
      data,
    };
  }

  /**
   * Create configuration for a specific bot
   * @param config The bot configuration
   */
  @Post()
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
  @Get()
  @SuccessResponse('200', 'All bots')
  public async getAllBots(): Promise<ApiResponse<Bot[]>> {
    const bots = await this.botDbService.getAllBots();
    return {
      success: true,
      data: bots,
    };
  }

  /**
   * Get statistics for all orders
   */
  @Get('statistics/all')
  @SuccessResponse('200', 'Order statistics')
  public async getOrderStatistics(): Promise<ApiResponse<OrderStatistics>> {
    const statistics = await this.botDbService.getOrderStatistics();
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * Get statistics for a specific bot's orders
   * @param botId The ID of the bot
   */
  @Get('{botId}/statistics')
  @SuccessResponse('200', 'Bot order statistics')
  public async getBotStatistics(@Path() botId: string): Promise<ApiResponse<OrderStatistics>> {
    const statistics = await this.botDbService.getBotOrderStatistics(botId);
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * Add a Binance order to the bot's orders
   * @param botId The ID of the bot
   * @param request The order request containing orderId and symbol
   */
  @Post('{botId}/filled-order')
  @SuccessResponse('200', 'Order')
  public async addBotFilledOrder(
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

  /**
   * Cleanup all data related to a testnet bot
   * @param botId The ID of the bot to cleanup
   */
  @Delete('cleanup/testnet/{botId}')
  @SuccessResponse('200', 'Testnet bot data cleaned up')
  public async cleanupTestnetBot(@Path() botId: string): Promise<
    ApiResponse<{
      ordersDeleted: number;
      testnetOrdersDeleted: number;
      filledOrdersQueueDeleted: number;
      testnetFilledOrdersQueueDeleted: number;
      botDeleted: boolean;
    }>
  > {
    try {
      const result = await this.botDbService.cleanupTestnetBot(botId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.setStatus(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
