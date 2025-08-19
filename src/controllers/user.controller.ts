import { Route, Tags, Controller, Get, SuccessResponse } from 'tsoa';
import { TradingService } from '../services/trading/trading.service';
import { tradingDbService } from '../services/trading/trading-db.service';
import { ApiResponse } from '../models/dto/response-dto';
import { Trader } from '../models/dto/user-dto';

/**
 * Controller for handling user-related operations
 */
@Route('user')
@Tags('User')
export class UserController extends Controller {
  private readonly tradingService = new TradingService(tradingDbService);

  /**
   * Get user data
   * @returns User data
   */
  @Get('')
  @SuccessResponse('200', 'User')
  public async getUser(): Promise<ApiResponse<Trader>> {
    const user = await this.tradingService.getUser();

    return {
      success: true,
      data: user,
    };
  }
}
