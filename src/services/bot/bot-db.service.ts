import { SpotRestAPI } from '@binance/spot';
import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import {
  BaseBot,
  BinanceBotOrder,
  Bot,
  BotConfig,
  ConsolidatedOrder,
  FilledOrderQueueItem,
  NewFilledOrderQueueItem,
  PagedData,
} from '../../models/dto/bot-dto';
import { NotFoundError, ValidationError } from '../../models/errors';
import { Document, ObjectId, WithId } from 'mongodb';
import { env } from '../../config/env';
import { OrderStatistics, OrderStatisticsResult } from '../../models/dto/statistics.dto';

export class BotDbService {
  constructor(private readonly mongoDbService: MongoDbService) {
    // Create the unique compound index on botId/orderId when service is initialized
    void this.ensureFilledOrdersQueueIndex();
    void this.ensureConsolidatedOrdersIndex();
  }

  /**
   * Gets the appropriate collection name based on testnet flag
   * @param baseCollectionName The base collection name
   * @returns The collection name with testnet prefix if in testnet mode
   */
  private getCollectionName(baseCollectionName: string): string {
    return env.TESTNET ? `testnet_${baseCollectionName}` : baseCollectionName;
  }

  public async insertBotOrder(order: SpotRestAPI.GetOrderResponse, botId: string): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<BinanceBotOrder>(this.getCollectionName('orders'));
      const result = await collection.insertOne({ ...order, botId: botId });
      logger.info(`Inserted order ${order.orderId} for bot ${botId}`, { result });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to insert bot order', error);
    }
  }

  /**
   * Inserts a consolidated order document (one per consolidate-pairs operation)
   * @param doc Consolidated order with botId, sellPrice, quoteQuantity
   */
  public async insertConsolidatedOrder(doc: ConsolidatedOrder): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<ConsolidatedOrder>(
        this.getCollectionName('consolidated_orders')
      );
      await collection.insertOne({ ...doc });
      logger.info('Inserted consolidated order', { botId: doc.botId, sellPrice: doc.sellPrice });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to insert consolidated order', error);
    }
  }

  /**
   * Returns the consolidated order with the lowest sellPrice for each botId.
   * @returns One ConsolidatedOrder per botId (the one with minimum sellPrice for that bot)
   */
  public async getConsolidatedOrdersWithLowestSellPricePerBot(): Promise<ConsolidatedOrder[]> {
    try {
      const collection = await this.mongoDbService.getCollection<ConsolidatedOrder & { _id?: unknown }>(
        this.getCollectionName('consolidated_orders')
      );
      const pipeline: Document[] = [
        { $sort: { botId: 1, sellPrice: 1 } },
        { $group: { _id: '$botId', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $project: { _id: 0, botId: 1, sellPrice: 1, quoteQuantity: 1 } },
      ];
      const results = await collection.aggregate<ConsolidatedOrder>(pipeline).toArray();
      logger.info('Retrieved consolidated orders with lowest sellPrice per bot', { count: results.length });
      return results;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError(
        'Failed to get consolidated orders with lowest sellPrice per bot',
        error
      );
    }
  }

  public async getBotOrders(botId: string): Promise<BinanceBotOrder[]> {
    try {
      const collection = await this.mongoDbService.getCollection<BinanceBotOrder>(this.getCollectionName('orders'));
      const orders = await collection.find({ botId }).toArray();
      logger.info(`Found ${orders.length} orders for bot ${botId}`);
      return orders;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get bot orders', error);
    }
  }

  public async getAllOrdersPaginated(
    pageNum: number,
    pageSize: number,
    side: 'BUY' | 'SELL',
    botId?: string
  ): Promise<PagedData<BinanceBotOrder>> {
    try {
      const collection = await this.mongoDbService.getCollection<BinanceBotOrder>(this.getCollectionName('orders'));

      const filter: { side: 'BUY' | 'SELL'; botId?: string } = { side };
      if (botId) {
        filter.botId = botId;
      }
      const skip = (pageNum - 1) * pageSize;

      const total = await collection.countDocuments(filter);
      const items = await collection.find(filter).sort({ updateTime: -1 }).skip(skip).limit(pageSize).toArray();

      const logContext = { pageNum, pageSize, side, ...(botId && { botId }) };
      logger.info(`Retrieved ${items.length} orders`, logContext);

      return { items, total, pageNum, pageSize };
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get paginated orders', error);
    }
  }

  public async getBot(id: string): Promise<Bot> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>(this.getCollectionName('bots'));
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
      const collection = await this.mongoDbService.getCollection<BaseBot>(this.getCollectionName('bots'));
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
      const collection = await this.mongoDbService.getCollection<BaseBot>(this.getCollectionName('bots'));
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
      const collection = await this.mongoDbService.getCollection<BaseBot>(this.getCollectionName('bots'));
      const bots = await collection.find().toArray();

      logger.info(`Retrieved ${bots.length} bots`);
      return bots.map((bot) => this.toApiModel(bot));
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get all bots', error);
    }
  }

  /**
   * Ensures that the consolidated_orders collection has an index for lowest-sellPrice-per-bot aggregation.
   */
  private async ensureConsolidatedOrdersIndex(): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<ConsolidatedOrder>(
        this.getCollectionName('consolidated_orders')
      );
      await collection.createIndex({ botId: 1, sellPrice: 1 });
      logger.info('Created index for consolidated_orders collection');
    } catch (error: unknown) {
      logger.error('Failed to create index for consolidated_orders collection', { error });
    }
  }

  /**
   * Ensures that the filledOrdersQueue collection has the required indexes
   */
  private async ensureFilledOrdersQueueIndex(): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );
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
  public async insertFilledOrdersQueue(items: NewFilledOrderQueueItem[]): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );

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
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );

      const items = await collection
        .find({
          detailsFetched: false,
          $or: [{ type: { $exists: false } }, { type: 'filled' }],
        })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();

      logger.info(`Retrieved ${items.length} unprocessed items from filledOrdersQueue`);
      return items;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get unprocessed items from filledOrdersQueue', error);
    }
  }

  /**
   * Get pending orders from the filledOrdersQueue for status checking
   * @param limit Maximum number of items to retrieve
   */
  public async getPendingOrders(limit: number): Promise<FilledOrderQueueItem[]> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );

      const items = await collection
        .find({
          detailsFetched: false,
          type: 'pending',
        })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();

      logger.info(`Retrieved ${items.length} pending orders from filledOrdersQueue`);
      return items;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get pending orders from filledOrdersQueue', error);
    }
  }

  /**
   * Mark a queue item as processed
   * @param botId Bot ID
   * @param orderId Order ID
   */
  public async markFilledOrderAsProcessed(botId: string, orderId: number): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );

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
      const collection = await this.mongoDbService.getCollection<FilledOrderQueueItem>(
        this.getCollectionName('filledOrdersQueue')
      );

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

  /**
   * Creates a MongoDB aggregation pipeline for order statistics
   * @returns MongoDB aggregation pipeline
   */
  private createOrderStatisticsPipeline(): Document[] {
    return [
      {
        $facet: {
          buyStats: [
            { $match: { side: 'BUY', status: 'FILLED' } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                total: {
                  $sum: { $toDouble: { $ifNull: ['$cummulativeQuoteQty', 0] } },
                },
              },
            },
          ],
          sellStats: [
            { $match: { side: 'SELL', status: 'FILLED' } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                total: {
                  $sum: { $toDouble: { $ifNull: ['$cummulativeQuoteQty', 0] } },
                },
              },
            },
          ],
        },
      },
    ];
  }

  /**
   * Processes the results from the order statistics pipeline
   * @param results The results from the aggregation pipeline
   * @returns Formatted order statistics
   */
  private processOrderStatisticsResults(results: OrderStatisticsResult): OrderStatistics {
    const buyOrdersCount = results.buyStats[0]?.count || 0;
    const sellOrdersCount = results.sellStats[0]?.count || 0;
    const totalBuyAmount = results.buyStats[0]?.total || 0;
    const totalSellAmount = results.sellStats[0]?.total || 0;
    const profitLoss = totalSellAmount - totalBuyAmount;

    return {
      buyOrdersCount,
      sellOrdersCount,
      totalBuyAmount,
      totalSellAmount,
      profitLoss,
    };
  }

  /**
   * Get statistics for all orders
   * @returns Statistics including buy/sell counts and amounts
   */
  public async getOrderStatistics(): Promise<OrderStatistics> {
    try {
      const ordersCollection = await this.mongoDbService.getCollection('orders');

      const pipeline = this.createOrderStatisticsPipeline();
      const [results] = await ordersCollection.aggregate<OrderStatisticsResult>(pipeline).toArray();

      return this.processOrderStatisticsResults(results);
    } catch (error) {
      throw this.mongoDbService.getMongoDbError('Failed to get order statistics', error);
    }
  }

  /**
   * Get statistics for a specific bot's orders
   * @param botId The ID of the bot
   * @returns Statistics including buy/sell counts and amounts for the specified bot
   */
  public async getBotOrderStatistics(botId: string): Promise<OrderStatistics> {
    try {
      const ordersCollection = await this.mongoDbService.getCollection('orders');

      const pipeline = this.createOrderStatisticsPipeline();
      pipeline.unshift({ $match: { botId } });
      const [results] = await ordersCollection.aggregate<OrderStatisticsResult>(pipeline).toArray();

      return this.processOrderStatisticsResults(results);
    } catch (error) {
      throw this.mongoDbService.getMongoDbError('Failed to get bot order statistics', error);
    }
  }

  /**
   * Cleanup all data related to a testnet bot
   * @param botId Bot ID to cleanup
   * @returns Object containing counts of deleted items
   * @throws Error if bot is not in testnet mode or if app is not running in testnet mode
   */
  public async cleanupTestnetBot(botId: string): Promise<{
    ordersDeleted: number;
    testnetOrdersDeleted: number;
    filledOrdersQueueDeleted: number;
    testnetFilledOrdersQueueDeleted: number;
    botDeleted: boolean;
  }> {
    // Validate that the app is running in testnet mode
    if (!env.TESTNET) {
      throw new ValidationError('Cleanup can only be performed in testnet mode');
    }

    // Get the bot to validate it's in testnet mode
    const bot = await this.getBot(botId);
    if (!bot || !bot.config || bot.config.mode !== 'testnet') {
      throw new ValidationError('Bot not found or not in testnet mode');
    }

    const result = {
      ordersDeleted: 0,
      testnetOrdersDeleted: 0,
      filledOrdersQueueDeleted: 0,
      testnetFilledOrdersQueueDeleted: 0,
      botDeleted: false,
    };

    try {
      // Clean up orders in both regular and testnet collections
      const ordersCollection = await this.mongoDbService.getCollection('orders');
      const deleteOrdersResult = await ordersCollection.deleteMany({ botId });
      result.ordersDeleted = deleteOrdersResult.deletedCount;

      const testnetOrdersCollection = await this.mongoDbService.getCollection('testnet_orders');
      const deleteTestnetOrdersResult = await testnetOrdersCollection.deleteMany({ botId });
      result.testnetOrdersDeleted = deleteTestnetOrdersResult.deletedCount;

      // Clean up filled orders queue in both regular and testnet collections
      const filledOrdersQueueCollection = await this.mongoDbService.getCollection('filledOrdersQueue');
      const deleteFilledOrdersResult = await filledOrdersQueueCollection.deleteMany({ botId });
      result.filledOrdersQueueDeleted = deleteFilledOrdersResult.deletedCount;

      const testnetFilledOrdersQueueCollection = await this.mongoDbService.getCollection('testnet_filledOrdersQueue');
      const deleteTestnetFilledOrdersResult = await testnetFilledOrdersQueueCollection.deleteMany({ botId });
      result.testnetFilledOrdersQueueDeleted = deleteTestnetFilledOrdersResult.deletedCount;

      // Delete the bot
      const botsCollection = await this.mongoDbService.getCollection('bots');
      const deleteBotResult = await botsCollection.deleteOne({ _id: new ObjectId(botId) });
      result.botDeleted = deleteBotResult.deletedCount > 0;

      logger.info('Cleaned up testnet bot data', { botId, result });
      return result;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to cleanup testnet bot data', error);
    }
  }
}
