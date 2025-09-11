import { MongoDbService } from '../base-mongodb.service';
import { logger } from '../../utils/logger';
import { NewTradingPair, TradingPair } from '../../models/trading-pair';
import { NotFoundError } from '../../models/errors';
import { ObjectId, OptionalId } from 'mongodb';
import { env } from '../../config/env';

type TradingPairDb = Omit<TradingPair, 'id'> & { _id: ObjectId; botId: string };
type InsertTradingPairDb = OptionalId<TradingPairDb>;

export class TradingPairDbService {
  constructor(private readonly mongoDbService: MongoDbService) {}

  /**
   * Gets the appropriate collection name based on testnet flag
   * @param baseCollectionName The base collection name
   * @returns The collection name with testnet prefix if in testnet mode
   */
  private getCollectionName(baseCollectionName: string): string {
    return env.TESTNET ? `testnet_${baseCollectionName}` : baseCollectionName;
  }

  private toApiModel(dbModel: TradingPairDb): TradingPair {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, botId, ...rest } = dbModel;
    return { id: _id.toString(), ...rest } as TradingPair;
  }

  public async getTradingPairs(botId: string): Promise<TradingPair[]> {
    try {
      const collection = await this.mongoDbService.getCollection<TradingPairDb>(this.getCollectionName('pairs'));
      const pairs = await collection.find({ botId }).toArray();

      logger.info(`Found ${pairs.length} trading pairs${botId ? ` for bot ${botId}` : ''}`);

      return pairs.map((pair) => this.toApiModel(pair));
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get trading pairs', error);
    }
  }

  public async createTradingPairs(botId: string, pairs: NewTradingPair[]): Promise<TradingPair[]> {
    try {
      const collection = await this.mongoDbService.getCollection<InsertTradingPairDb>(this.getCollectionName('pairs'));

      const pairsWithBotId = pairs.map<InsertTradingPairDb>((pair) => ({
        ...pair,
        botId,
      }));

      const result = await collection.insertMany(pairsWithBotId);

      const insertedPairs = await collection.find({ _id: { $in: Object.values(result.insertedIds) } }).toArray();

      const apiPairs = insertedPairs.map((pair) => this.toApiModel(pair));
      logger.info(`Created ${apiPairs.length} trading pairs`, { result });

      return apiPairs;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to create trading pairs', error);
    }
  }

  public async getTradingPairById(id: string): Promise<TradingPair> {
    try {
      const collection = await this.mongoDbService.getCollection<TradingPairDb>(this.getCollectionName('pairs'));
      const pair = await collection.findOne({ _id: new ObjectId(id) });

      if (!pair) {
        throw new NotFoundError(`Trading pair ${id} not found`);
      }

      logger.info(`Retrieved trading pair ${id}`, { pair });
      return this.toApiModel(pair);
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to get trading pair', error);
    }
  }

  public async updateTradingPair(id: string, data: TradingPair): Promise<TradingPair> {
    try {
      const collection = await this.mongoDbService.getCollection<TradingPairDb>(this.getCollectionName('pairs'));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...updated } = data;

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updated },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError(`Trading pair ${id} not found`);
      }

      const updatedPair = this.toApiModel(result);
      logger.info(`Updated trading pair ${id}`, { updatedPair });
      return updatedPair;
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to update trading pair', error);
    }
  }

  public async deleteTradingPair(id: string): Promise<void> {
    try {
      const collection = await this.mongoDbService.getCollection<TradingPairDb>(this.getCollectionName('pairs'));

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        throw new NotFoundError(`Trading pair ${id} not found`);
      }

      logger.info(`Deleted trading pair ${id}`);
    } catch (error: unknown) {
      throw this.mongoDbService.getMongoDbError('Failed to delete trading pair', error);
    }
  }
}
