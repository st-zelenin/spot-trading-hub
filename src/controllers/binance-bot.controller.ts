import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, SuccessResponse, Tags } from 'tsoa';
import { ExchangeType } from '../models/exchange';
import { BinanceService } from '../services/binance/binance.service';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { ApiResponse } from '../models/dto/response-dto';
import { BotDbService } from '../services/bot/bot-db.service';
import { mongoDbService } from '../services/base-mongodb.service';
import {
  BinanceBotOrder,
  Bot,
  BotConfig,
  BotTradingPair,
  ConsolidatePairsRequest,
  ConsolidatedOrder,
  NewFilledOrderQueueItem,
  PagedData,
  UpdateBottomWeightedSellQuoteRequest,
} from '../models/dto/bot-dto';
import { OrderStatistics } from '../models/dto/statistics.dto';
import { sendConfigUpdateToBot } from '../binance-wss-server';
import { TradingPairDbService } from '../services/trading-pair/trading-pair-db.service';
import { TradingPair } from '../models/trading-pair';
import { ProgressiveBotService } from '../services/bot/progressive-bot.service';

@Route('binance-bot')
@Tags('Binance Bot')
export class BinanceBotController extends Controller {
  private readonly botDbService = new BotDbService(mongoDbService);
  private readonly tradingPairDbService = new TradingPairDbService(mongoDbService);
  private readonly progressiveBotService = new ProgressiveBotService(this.botDbService);

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
   * Get the consolidated order with the lowest sellPrice for each botId.
   */
  @Get('consolidated-orders/lowest-by-bot')
  @SuccessResponse('200', 'Consolidated order with lowest sellPrice per bot')
  public async getConsolidatedOrdersLowestByBot(): Promise<ApiResponse<ConsolidatedOrder[]>> {
    const data = await this.botDbService.getConsolidatedOrdersWithLowestSellPricePerBot();
    return {
      success: true,
      data,
    };
  }

  /**
   * Get paginated orders from all bots with filtering
   * @param pageNum Page number (1-based)
   * @param pageSize Number of items per page
   * @param side Order side filter (BUY or SELL)
   * @param botId Optional bot ID to filter orders by specific bot
   */
  @Get('orders')
  @SuccessResponse('200', 'Paginated orders')
  public async getAllOrders(
    @Query() pageNum: number,
    @Query() pageSize: number,
    @Query() side: 'BUY' | 'SELL',
    @Query() botId?: string
  ): Promise<ApiResponse<PagedData<BinanceBotOrder>>> {
    const orders = await this.botDbService.getAllOrdersPaginated(pageNum, pageSize, side, botId);
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
   * Consolidate count pairs with highest sell price into one order; reduce numPairs by count; save remaining pairs.
   * @param botId The ID of the bot
   * @param body Request body with count (number of pairs to consolidate)
   * @returns Updated bot
   */
  @Put('{botId}/consolidate-pairs')
  @SuccessResponse('200', 'Pairs consolidated')
  public async consolidatePairs(
    @Path() botId: string,
    @Body() body: ConsolidatePairsRequest
  ): Promise<ApiResponse<Bot>> {
    await this.progressiveBotService.consolidateTopPairs(botId, body.count);
    const bot = await this.botDbService.getBot(botId);
    return {
      success: true,
      data: bot,
    };
  }

  /**
   * Update bottom-weighted bot pairs with sellQuoteAmount and store sell fractions in config.
   * Loads pairs from the pairs collection, computes sellQuoteAmount per level, persists pairs and config.
   * @param botId The ID of the bot
   * @param body Request body with sellFractionTop and sellFractionBottom
   * @returns Updated bot
   */
  @Put('{botId}/bottom-weighted-pairs/update-sell-quote')
  @SuccessResponse('200', 'Bottom-weighted pairs and config updated')
  public async updateBottomWeightedPairsSellQuote(
    @Path() botId: string,
    @Body() body: UpdateBottomWeightedSellQuoteRequest
  ): Promise<ApiResponse<Bot>> {
    const { sellFractionTop, sellFractionBottom } = body;

    const bot = await this.botDbService.getBot(botId);

    if (bot.config.botType !== 'bottom-weighted') {
      this.setStatus(400);
      return {
        success: false,
        error: 'Bot is not a bottom-weighted bot',
      };
    }

    const symbol = bot.config.symbol;
    if (typeof symbol !== 'string' || !symbol) {
      this.setStatus(400);
      return {
        success: false,
        error: 'Bot config is missing symbol',
      };
    }

    const pairs = await this.tradingPairDbService.getTradingPairs(botId);

    if (pairs.length !== bot.config.numPairs) {
      this.setStatus(400);
      return {
        success: false,
        error: 'Number of pairs does not match bot config',
      };
    }

    const sortedPairs = [...pairs].sort((a, b) => b.buyPrice - a.buyPrice);

    const binanceService = ExchangeFactory.getExchangeService(ExchangeType.BINANCE);
    const symbolInfo = await binanceService.getExchangeInfo(symbol);
    const quotePrecision = symbolInfo.quotePrecision ?? 2;

    const roundDownToPrecision = (value: number, decimals: number): number => {
      const factor = 10 ** decimals;
      return value >= 0 ? Math.floor(value * factor) / factor : Math.ceil(value * factor) / factor;
    };

    const updatedPairs: TradingPair[] = [];

    for (let i = 0; i < sortedPairs.length; i++) {
      const pair = sortedPairs[i];
      const quantity = pair.quantity;
      const sellPrice = pair.sellPrice;

      if (typeof quantity !== 'number' || typeof sellPrice !== 'number' || quantity < 0 || sellPrice < 0) {
        this.setStatus(400);
        return {
          success: false,
          error: `Pair ${pair.id} has invalid quantity or sellPrice`,
        };
      }

      const sellFractionAtI =
        pairs.length > 1
          ? sellFractionTop - (sellFractionTop - sellFractionBottom) * (i / (pairs.length - 1))
          : sellFractionTop;

      const rawSellQuoteAmount = quantity * sellPrice * sellFractionAtI;
      const sellQuoteAmount = roundDownToPrecision(rawSellQuoteAmount, quotePrecision);

      updatedPairs.push({ ...pair, sellQuoteAmount });
    }

    for (const pair of updatedPairs) {
      await this.tradingPairDbService.updateTradingPair(pair.id, pair);
    }

    const updatedBot = await this.botDbService.updateBot(botId, {
      config: { ...bot.config, sellFractionTop, sellFractionBottom },
    });

    sendConfigUpdateToBot(botId, updatedBot.config);

    return {
      success: true,
      data: updatedBot,
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

  // /**
  //  * Place a limit order and add it to pending queue
  //  * @param botId The ID of the bot
  //  * @param request The limit order request
  //  */
  // @Post('{botId}/limit-order')
  // @SuccessResponse('200', 'Limit order placed and queued')
  // public async placeLimitOrder(
  //   @Path() botId: string,
  //   @Body() request: Omit<PlaceLimitOrderRequest, 'side'>
  // ): Promise<ApiResponse<string>> {
  //   const binanceService = ExchangeFactory.getExchangeService(ExchangeType.BINANCE) as BinanceService;

  //   const orderId = await binanceService.placeLimitOrder('sell', request.symbol, request.quantity, request.price);

  //   const queueItem: NewFilledOrderQueueItem = {
  //     botId,
  //     orderId: parseInt(orderId, 10),
  //     symbol: request.symbol,
  //     type: 'pending',
  //   };

  //   await this.botDbService.insertFilledOrdersQueue([queueItem]);

  //   return {
  //     success: true,
  //     data: orderId,
  //   };
  // }

  /**
   * Insert a filled order into the processing queue
   * @param botId The ID of the bot
   * @param request The order request containing orderId and symbol
   */
  @Post('{botId}/pending-order')
  @SuccessResponse('200', 'Filled order added to queue')
  public async insertFilledOrderQueue(
    @Path() botId: string,
    @Body() request: { orderId: number; symbol: string }
  ): Promise<ApiResponse<null>> {
    const queueItem: NewFilledOrderQueueItem = {
      botId,
      orderId: request.orderId,
      symbol: request.symbol,
      type: 'pending',
    };

    await this.botDbService.insertFilledOrdersQueue([queueItem]);

    return {
      success: true,
      data: null,
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
