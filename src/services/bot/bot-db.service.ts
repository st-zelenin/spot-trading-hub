import { SpotRestAPI } from '@binance/spot';
import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import { BinanceBotOrder } from '../../models/dto/bot-dto';

export class BotDbService {
  constructor(private readonly mongoDbService: MongoDbService) {}

  public async insertBotOrder(order: SpotRestAPI.GetOrderResponse, botId: string): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<BinanceBotOrder>('orders');
      const result = await collection.insertOne({ ...order, botId: botId });
      logger.info(`Inserted order ${order.orderId} for bot ${botId}`, { result });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to insert bot order', error);
    }
  }

  public async getBotOrders(botId: string): Promise<BinanceBotOrder[]> {
    try {
      const collection = await this.mongoDbService.getCollection<BinanceBotOrder>('orders');
      const orders = await collection.find({ botId }).toArray();
      logger.info(`Found ${orders.length} orders for bot ${botId}`);
      return orders;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get bot orders', error);
    }
  }
}
