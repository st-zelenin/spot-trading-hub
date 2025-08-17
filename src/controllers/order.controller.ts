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
  public async cancelOrder(@Body() requestBody: CancelOrderRequest): Promise<ApiResponse<void>> {
    const { exchange, orderId, symbol } = requestBody;

    logger.info('Cancel order request received', { exchange, orderId, symbol });

    try {
      if (!exchange) {
        throw new Error('exchange param is missing');
      }

      if (!orderId) {
        throw new Error('orderId param is missing');
      }

      if (!symbol) {
        throw new Error('symbol param is missing');
      }

      const exchangeService = ExchangeFactory.getExchangeService(exchange);
      await exchangeService.cancelOrder(orderId, symbol);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Error in cancel order controller', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cancels all orders for a symbol on the specified exchange
   * @param requestBody The order cancellation request
   */
  @Post('cancel-all')
  @SuccessResponse('200', 'All orders cancelled successfully')
  @Response('400', 'Bad request, missing or invalid parameters')
  @Response('500', 'Server error or exchange error')
  public async cancelAllOrders(@Body() requestBody: CancelAllOrdersRequest): Promise<ApiResponse<void>> {
    const { exchange, symbol } = requestBody;

    logger.info('Cancel all orders request received', { exchange, symbol });

    try {
      if (!exchange) {
        throw new Error('exchange param is missing');
      }

      if (!symbol) {
        throw new Error('symbol param is missing');
      }

      const exchangeService = ExchangeFactory.getExchangeService(exchange);
      await exchangeService.cancelAllOrders(symbol);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Error in cancel all orders controller', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
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
  ): Promise<ApiResponse<string>> {
    const { exchange, symbol, quantity, limitPrice } = requestBody;

    logger.info('Trailing take profit limit sell order request received', {
      exchange,
      symbol,
      quantity,
      limitPrice,
    });

    try {
      if (!exchange) {
        throw new Error('exchange param is missing');
      }

      if (!symbol) {
        throw new Error('symbol param is missing');
      }

      if (!quantity || quantity <= 0) {
        throw new Error('quantity param is missing or invalid');
      }

      if (!limitPrice || limitPrice <= 0) {
        throw new Error('limitPrice param is missing or invalid');
      }

      const exchangeService = ExchangeFactory.getExchangeService(exchange);
      const orderId = await exchangeService.placeTrailingTakeProfitLimitSellOrder(symbol, quantity, limitPrice);

      return {
        success: true,
        data: orderId,
      };
    } catch (error) {
      logger.error('Error in place trailing take profit limit sell order controller', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
