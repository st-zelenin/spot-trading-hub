import { SpotRestAPI } from '@binance/spot';
import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import { BaseBot, BinanceBotOrder, Bot, BotConfig, BotTradingPair } from '../../models/dto/bot-dto';
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

      logger.info(`Retrieved config for bot ${id}`);
      return this.toApiModel(bot);
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get bot config', error);
    }
  }

  public async updateBotConfig(id: string, config: BotConfig): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { config } }, { upsert: true });
      logger.info(`Updated config for bot ${id}`, { result });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to update bot config', error);
    }
  }

  public async updateBotPairs(id: string, pairs: BotTradingPair[]): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<BaseBot>('bots');
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { pairs } });

      if (!result.matchedCount) {
        throw new NotFoundError(`Bot ${id} not found`);
      }

      logger.info(`Updated pairs for bot ${id}`, { result });
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to update bot pairs', error);
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

  private toApiModel<T>(dbModel: WithId<T>): T & { id: string } {
    const { _id, ...rest } = dbModel;
    return {
      id: _id.toString(),
      ...rest,
    } as T & { id: string };
  }
}
