import { Body, Controller, Get, Post, Put, Path, Query, Route, SuccessResponse, Tags } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { TradingPair, NewTradingPair } from '../models/trading-pair';
import { TradingPairDbService } from '../services/trading-pair/trading-pair-db.service';
import { logger } from '../utils/logger';
import { mongoDbService } from '../services/base-mongodb.service';

@Route('trading-pairs')
@Tags('Trading Pairs')
export class TradingPairController extends Controller {
  private readonly tradingPairDbService = new TradingPairDbService(mongoDbService);

  /**
   * Get all trading pairs
   * @param botId Bot ID to filter trading pairs
   * @returns Array of trading pairs
   */
  @Get()
  @SuccessResponse('200', 'Trading pairs retrieved successfully')
  public async getAllTradingPairs(@Query() botId: string): Promise<ApiResponse<TradingPair[]>> {
    logger.info(`Fetching trading pairs${botId}`);

    const pairs = await this.tradingPairDbService.getTradingPairs(botId);

    logger.info(`Successfully fetched ${pairs.length} trading pairs`);

    return {
      success: true,
      data: pairs,
    };
  }

  /**
   * Create multiple trading pairs
   * @param botId Bot ID for the trading pairs
   * @param pairs Array of trading pairs to create (without id)
   * @returns Array of created trading pairs with generated ids
   */
  @Post()
  @SuccessResponse('201', 'Trading pairs created successfully')
  public async createTradingPairs(
    @Query() botId: string,
    @Body() pairs: NewTradingPair[]
  ): Promise<ApiResponse<TradingPair[]>> {
    logger.info(`Creating ${pairs.length} trading pairs for bot ${botId}`);

    const createdPairs = await this.tradingPairDbService.createTradingPairs(botId, pairs);

    logger.info(`Successfully created ${createdPairs.length} trading pairs`);

    this.setStatus(201);
    return {
      success: true,
      data: createdPairs,
    };
  }

  /**
   * Update a trading pair by ID
   * @param id Trading pair ID
   * @param data Partial trading pair data to update
   * @returns Updated trading pair
   */
  @Put('{id}')
  @SuccessResponse('200', 'Trading pair updated successfully')
  public async updateTradingPair(
    @Path() id: string,
    @Body() data: Partial<NewTradingPair>
  ): Promise<ApiResponse<TradingPair>> {
    logger.info(`Updating trading pair ${id}`);

    const updatedPair = await this.tradingPairDbService.updateTradingPair(id, data);

    logger.info(`Successfully updated trading pair ${id}`);

    return {
      success: true,
      data: updatedPair,
    };
  }
}
