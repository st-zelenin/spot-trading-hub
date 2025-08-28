import { SpotRestAPI } from '@binance/spot';
import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import { BaseBot, BinanceBotOrder, Bot, BotConfig, FilledOrderQueueItem } from '../../models/dto/bot-dto';
import { NotFoundError } from '../../models/errors';
import { ObjectId, WithId } from 'mongodb';

export class BotDbService {
  constructor(private readonly mongoDbService: MongoDbService) {
    // Create the unique compound index on botId/orderId when service is initialized
    void this.ensureFilledOrdersQueueIndex();
  }

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
      const result = await collection.insertOne({ config, pairs: [] });
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
   * Ensures that the filledOrdersQueue collection has the required indexes
   */
  private async ensureFilledOrdersQueueIndex(): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>('filledOrdersQueue');
      await collection.createIndex({ botId: 1, orderId: 1 }, { unique: true });
      await collection.createIndex({ detailsFetched: 1, createdAt: 1 });
      logger.info('Created indexes for filledOrdersQueue collection');
    } catch (error: unknown) {
      logger.error('Failed to create indexes for filledOrdersQueue collection', { error });
    }
  }

  /**
   * Insert items into the filledOrdersQueue collection
   * @param items Array of queue items to insert
   */
  public async insertFilledOrdersQueue(
    items: Omit<FilledOrderQueueItem, 'createdAt' | 'detailsFetched'>[]
  ): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>('filledOrdersQueue');

      const itemsWithTimestamp = items.map((item) => ({
        ...item,
        createdAt: new Date(),
        detailsFetched: false,
      }));

      const result = await collection.insertMany(itemsWithTimestamp, { ordered: false });

      logger.info(`Inserted ${result.insertedCount} items into filledOrdersQueue`, {
        insertedCount: result.insertedCount,
        totalItems: items.length,
      });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to insert items into filledOrdersQueue', error);
    }
  }

  /**
   * Get unprocessed items from the filledOrdersQueue
   * @param limit Maximum number of items to retrieve
   */
  public async getUnprocessedFilledOrders(limit: number): Promise<FilledOrderQueueItem[]> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>('filledOrdersQueue');

      const items = await collection.find({ detailsFetched: false }).sort({ createdAt: 1 }).limit(limit).toArray();

      logger.info(`Retrieved ${items.length} unprocessed items from filledOrdersQueue`);
      return items;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get unprocessed items from filledOrdersQueue', error);
    }
  }

  /**
   * Mark a queue item as processed
   * @param botId Bot ID
   * @param orderId Order ID
   */
  public async markFilledOrderAsProcessed(botId: string, orderId: number): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>('filledOrdersQueue');

      const result = await collection.updateOne(
        { botId, orderId },
        { $set: { detailsFetched: true, processedAt: new Date() } }
      );

      if (!result.matchedCount) {
        logger.warn(`No matching order found to mark as processed`, { botId, orderId });
      } else {
        logger.info(`Marked order as processed`, { botId, orderId });
      }
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to mark order as processed', error);
    }
  }

  /**
   * Clean up processed items older than the specified age
   * @param maxAgeMs Maximum age in milliseconds
   */
  public async cleanupProcessedFilledOrders(maxAgeMs: number): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>('filledOrdersQueue');

      const cutoffDate = new Date(Date.now() - maxAgeMs);

      const result = await collection.deleteMany({
        detailsFetched: true,
        processedAt: { $lt: cutoffDate },
      });

      logger.info(`Cleaned up ${result.deletedCount} processed items from filledOrdersQueue`);
    } catch (error: unknown) {
      logger.error('Failed to clean up processed items from filledOrdersQueue', { error });
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
