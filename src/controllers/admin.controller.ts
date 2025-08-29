import { Body, Controller, Post, Route, SuccessResponse, Tags } from 'tsoa';
import { ApiResponse } from '../models/dto/response-dto';
import { logger } from '../utils/logger';
import { binanceDbService } from '../services/binance/binance-db.service';
import { CONTAINER_NAMES } from '../constants';
import { MigrateSymbolRequest, MigrationResult } from '../models/dto/admin-dto';

@Route('admin')
@Tags('Admin')
export class AdminController extends Controller {
  /**
   * Migrate orders from one symbol to another
   * @param request The migration request containing from and to symbols
   */
  @Post('migrate-symbol')
  @SuccessResponse('200', 'Symbol migration completed')
  public async migrateSymbol(@Body() request: MigrateSymbolRequest): Promise<ApiResponse<MigrationResult>> {
    const { from, to } = request;

    logger.info(`Starting symbol migration from ${from} to ${to}`);

    try {
      const query = 'SELECT * FROM c WHERE c.symbol = @p0';
      const orders = await binanceDbService.queryContainer<{ id: string; symbol: string }>(
        CONTAINER_NAMES.Orders,
        query,
        [from]
      );

      logger.info(`Found ${orders.length} orders with symbol ${from}`);

      if (orders.length === 0) {
        return {
          success: true,
          data: { ordersProcessed: 0 },
        };
      }

      const container = await binanceDbService.getContainer(CONTAINER_NAMES.Orders);

      for (const order of orders) {
        const backupOrder = { ...order };
        try {
          await container.item(order.id, from).delete();

          order.symbol = to;

          await container.items.create(order);

          logger.info(`Migrated order ${order.id} from symbol ${from} to ${to}`);
        } catch (error) {
          // rollback
          try {
            await container.items.create(backupOrder);
          } catch (rollbackError) {
            logger.error('Failed to rollback order ${order.id} from symbol ${to} to ${from}', { error });
          }
          logger.error(`Failed to migrate order ${order.id}`, { error });
          throw error;
        }
      }

      logger.info(`Successfully migrated ${orders.length} orders from ${from} to ${to}`);

      return {
        success: true,
        data: { ordersProcessed: orders.length },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to migrate symbol from ${from} to ${to}: ${errorMessage}`);

      throw error;
    }
  }
}
