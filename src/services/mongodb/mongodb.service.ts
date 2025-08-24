import { Collection, Db, Document, MongoClient } from 'mongodb';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

/**
 * MongoDB Service for handling database operations
 */
class MongoDbService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collections: Map<string, Collection<Document>> = new Map();

  /**
   * Initialize the MongoDB connection
   */
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
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get a collection by name, creating it if it doesn't exist
   */
  public async getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    if (!this.db) {
      throw new Error('MongoDB not initialized. Call initialize() first.');
    }

    const existingCollection = this.collections.get(collectionName);
    if (existingCollection) {
      return existingCollection as unknown as Collection<T>;
    }

    return this.createCollection<T>(collectionName);
  }

  /**
   * Create a collection if it doesn't exist
   */
  private async createCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    if (!this.db) {
      throw new Error('MongoDB not initialized. Call initialize() first.');
    }

    try {
      const collections = await this.db.listCollections({ name: collectionName }).toArray();

      if (collections.length === 0) {
        logger.info(`Creating collection: ${collectionName}`);
        await this.db.createCollection(collectionName);
      }

      const collection = this.db.collection<T>(collectionName);
      this.collections.set(collectionName, collection as unknown as Collection<Document>);
      return collection;
    } catch (error) {
      logger.error(`Failed to create collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Close the MongoDB connection
   */
  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.collections.clear();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        throw error;
      }
    }
  }
}

// Export a singleton instance
export const mongoDbService = new MongoDbService();
