import { Body, Controller, Delete, Get, Path, Post, Route, SuccessResponse, Tags } from 'tsoa';
import { OrderedSymbols } from '../models/dto/crypto-pair.dto';
import { TradingService } from '../services/trading/trading.service';
import { tradingDbService } from '../services/trading/trading-db.service';
import { ApiResponse } from '../models/dto/response-dto';
import { Trader } from '../models/dto/user-dto';
import { ExchangeType } from '../models/exchange';

/**
 * Controller for handling user-related operations
 */
@Route('user')
@Tags('User')
export class UserController extends Controller {
  private readonly tradingService: TradingService;

  constructor() {
    super();
    this.tradingService = new TradingService(tradingDbService);
  }

  /**
   * Get user data
   * @returns User data
   */
  @Get()
  @SuccessResponse('200', 'User data retrieved successfully')
  public async getUser(): Promise<ApiResponse<Trader>> {
    const user = await this.tradingService.getUser();

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Order cryptocurrency pairs according to user preference
   * @param requestBody The ordered symbols payload
   * @returns Updated user data
   */
  @Post('pairs/order')
  @SuccessResponse('200', 'Pairs ordered successfully')
  public async orderPairs(@Body() requestBody: OrderedSymbols): Promise<ApiResponse<Trader>> {
    const updatedUser = await this.tradingService.orderPairs(requestBody.exchange, requestBody.symbols);

    return {
      success: true,
      data: updatedUser,
    };
  }

  /**
   * Add a cryptocurrency pair to user's list
   * @param exchange The exchange type
   * @param symbol The symbol to add
   * @returns Updated user data
   */
  @Post('pairs/add/:exchange/:symbol')
  @SuccessResponse('200', 'Pair added successfully')
  public async addPair(@Path() exchange: ExchangeType, @Path() symbol: string): Promise<ApiResponse<Trader>> {
    const updatedUser = await this.tradingService.addPair(exchange, symbol);

    return {
      success: true,
      data: updatedUser,
    };
  }

  /**
   * Remove a cryptocurrency pair from user's list
   * @param exchange The exchange type
   * @param symbol The symbol to remove
   * @returns Updated user data
   */
  @Delete('pairs/remove/:exchange/:symbol')
  @SuccessResponse('200', 'Pair removed successfully')
  public async removePair(@Path() exchange: ExchangeType, @Path() symbol: string): Promise<ApiResponse<Trader>> {
    const updatedUser = await this.tradingService.removePair(exchange, symbol);

    return {
      success: true,
      data: updatedUser,
    };
  }
}
