import { Collection, Db, Document, MongoClient, MongoError } from 'mongodb';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { MongoDbError } from '../models/errors';

export interface MongoDbService {
  initialize(): Promise<void>;
  getCollection<T extends Document>(collectionName: string): Promise<Collection<T>>;
  close(): Promise<void>;
  getMongoDbError(message: string, error: unknown): MongoDbError;
}

export class BaseMongoDbService implements MongoDbService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly collections: Map<string, Collection<Document>> = new Map();

  public async initialize(): Promise<void> {
    try {
      if (!this.client) {
        logger.info('Initializing MongoDB connection...');
        this.client = new MongoClient(env.MONGO_URI);
        await this.client.connect();
        logger.info('Connected to MongoDB');
        this.db = this.client.db(env.MONGO_DB_NAME);
      }
    } catch (error) {
      throw this.getMongoDbError('Failed to connect to MongoDB', error);
    }
  }

  public async getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    if (!this.db) {
      throw new MongoDbError('MongoDB not initialized. Call initialize() first.');
    }

    const existingCollection = this.collections.get(collectionName);
    if (existingCollection) {
      return existingCollection as unknown as Collection<T>;
    }

    return this.createCollection<T>(collectionName);
  }

  private async createCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    if (!this.db) {
      throw new MongoDbError('MongoDB not initialized. Call initialize() first.');
    }

    try {
      const collections = await this.db.listCollections({ name: collectionName }).toArray();

      if (!collections.length) {
        logger.info(`Creating collection: ${collectionName}`);
        await this.db.createCollection(collectionName);
      }

      const collection = this.db.collection<T>(collectionName);

      // Create unique index on orderId for orders collection to prevent duplicates
      if (collectionName === 'orders') {
        logger.info('Creating unique index on orderId field for orders collection');
        await collection.createIndex({ orderId: 1 }, { unique: true });
      }

      this.collections.set(collectionName, collection as unknown as Collection<Document>);
      return collection;
    } catch (error) {
      throw this.getMongoDbError(`Failed to create collection ${collectionName}`, error);
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.collections.clear();
        logger.info('MongoDB connection closed');
      } catch (error) {
        throw this.getMongoDbError('Error closing MongoDB connection', error);
      }
    }
  }

  public getMongoDbError(message: string, error: unknown): MongoDbError {
    if (error instanceof MongoError) {
      throw new MongoDbError(`${message}: [${error.code}]: ${error.name} - ${error.message}`);
    }

    if (error instanceof Error) {
      throw new MongoDbError(`${message}: ${error.name} - ${error.message}`);
    }

    return new MongoDbError(`${message}: Unknown error`);
  }
}

export const mongoDbService = new BaseMongoDbService();
