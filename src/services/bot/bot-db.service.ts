import { SpotRestAPI } from '@binance/spot';
import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import { BaseBot, BinanceBotOrder, Bot, BotConfig } from '../../models/dto/bot-dto';
import { NotFoundError } from '../../models/errors';
import { ObjectId, WithId } from 'mongodb';

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

  public async getBot(id: string): Promise<Bot> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const bot = await collection.findOne({ _id: new ObjectId(id) });

      if (!bot) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      logger.info(`Retrieved bot ${id}`, { bot });
      return this.toApiModel(bot);
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get bot', { error });
    }
  }

  public async createBot(config: BotConfig): Promise<Bot> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const result = await collection.insertOne({ config, pairs: [], orderPendingDetails: [] });
      const rawBot = await collection.findOne({ _id: result.insertedId });

      if (!rawBot) {
        throw new NotFoundError(`Bot ${result.insertedId.toString()} not found`);
      }

      const bot: Bot = this.toApiModel(rawBot);
      logger.info(`Created config for bot ${bot.id}`, { result });

      return bot;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to create bot config', error);
    }
  }

  /**
   * Update a bot
   * @param id The bot ID
   * @param data Partial data to update
   * @returns The updated bot
   */
  public async updateBot(id: string, data: Partial<BaseBot>): Promise<Bot> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const bot = await collection.findOne({ _id: new ObjectId(id) });
      if (!bot) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      const updateObj: Record<string, unknown> = {};

      if (data.config) {
        updateObj.config = { ...bot.config, ...data.config };
      }

      if (data.pairs !== undefined) {
        updateObj.pairs = data.pairs;
      }

      if (data.orderPendingDetails !== undefined) {
        updateObj.orderPendingDetails = data.orderPendingDetails;
      }

      if (Object.keys(updateObj).length === 0) {
        logger.warn(`No fields to update for bot ${id}`);
        return this.toApiModel(bot);
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateObj },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      logger.info(`Updated bot ${id}`, {
        updatedFields: Object.keys(updateObj),
        result,
      });

      return this.toApiModel(result);
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to update bot', error);
    }
  }

  public async getAllBots(): Promise<Bot[]> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const bots = await collection.find().toArray();

      logger.info(`Retrieved ${bots.length} bots`);
      return bots.map((bot) => this.toApiModel(bot));
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get all bots', error);
    }
  }

  /**
   * Add order IDs to the bot's orderPendingDetails array, ensuring uniqueness
   * @param id The bot ID
   * @param orderIds Array of order IDs to add
   */
  public async addOrdersPendingDetails(id: string, orderIds: number[]): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');

      const bot = await collection.findOne({ _id: new ObjectId(id) });

      if (!bot) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      const existingOrderIds = bot.orderPendingDetails || [];
      const uniqueOrderIds = [...new Set([...existingOrderIds, ...orderIds])];

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { orderPendingDetails: uniqueOrderIds } }
      );

      if (!result.matchedCount) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      logger.info(`Updated orderPendingDetails for bot ${id}, added ${orderIds.length} order IDs`, {
        addedIds: orderIds,
        totalUniqueIds: uniqueOrderIds.length,
      });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to add orders pending details to bot', error);
    }
  }

  private toApiModel<T>(dbModel: WithId<T>): T & { id: string } {
    const { _id, ...rest } = dbModel;
    return {
      id: _id.toString(),
      ...rest,
    } as T & { id: string };
  }
}
