import { Body, Controller, Post, Route, Response, SuccessResponse, Tags } from 'tsoa';
import { ExchangeFactory } from '../services/exchange-factory.service';
import { logger } from '../utils/logger';
import {
  CancelOrderRequest,
  CancelAllOrdersRequest,
  TrailingTakeProfitLimitSellOrderRequest,
} from '../models/dto/order-dto';
import { ApiResponse } from '../models/dto/response-dto';

/**
 * Controller for handling order-related operations
 */
@Route('orders')
@Tags('Orders')
export class OrderController extends Controller {
  /**
   * Cancels an order on the specified exchange
   * @param requestBody The order cancellation request
   * @returns API response indicating success or failure
   */
  @Post('cancel')
  @SuccessResponse('200', 'Order cancelled successfully')
  @Response('400', 'Bad request, missing or invalid parameters')
  @Response('500', 'Server error or exchange error')
  public async cancelOrder(@Body() requestBody: CancelOrderRequest): Promise<ApiResponse<null>> {
    const { exchange, orderId, symbol } = requestBody;

    logger.info('Cancel order request received', { exchange, orderId, symbol });

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    await exchangeService.cancelOrder(orderId, symbol);

    return {
      success: true,
      data: null,
    };
  }

  /**
   * Cancels all orders for a symbol on the specified exchange
   * @param requestBody The order cancellation request
   */
  @Post('cancel-all')
  @SuccessResponse('200', 'All orders cancelled successfully')
  @Response('400', 'Bad request, missing or invalid parameters')
  @Response('500', 'Server error or exchange error')
  public async cancelAllOrders(@Body() requestBody: CancelAllOrdersRequest): Promise<ApiResponse<null>> {
    const { exchange, symbol } = requestBody;

    logger.info('Cancel all orders request received', { exchange, symbol });

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    await exchangeService.cancelAllOrders(symbol);

    return {
      success: true,
      data: null,
    };
  }

  /**
   * Places a trailing take profit limit sell order on the specified exchange
   * @param requestBody The order request
   * @returns API response with the order ID if successful
   */
  @Post('trailing-sell')
  @SuccessResponse('200', 'Order placed successfully')
  @Response('400', 'Bad request, missing or invalid parameters')
  @Response('500', 'Server error or exchange error')
  public async placeTrailingTakeProfitLimitSellOrder(
    @Body() requestBody: TrailingTakeProfitLimitSellOrderRequest
  ): Promise<ApiResponse<string | null>> {
    const { exchange, symbol, quantity, limitPrice } = requestBody;

    logger.info('Trailing take profit limit sell order request received', {
      exchange,
      symbol,
      quantity,
      limitPrice,
    });

    const exchangeService = ExchangeFactory.getExchangeService(exchange);
    const orderId = await exchangeService.placeTrailingTakeProfitLimitSellOrder(symbol, quantity, limitPrice);

    return {
      success: true,
      data: orderId,
    };
  }
}
