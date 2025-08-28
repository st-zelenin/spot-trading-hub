import { CosmosClient, Container, Database, SqlQuerySpec, JSONValue } from '@azure/cosmos';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CosmosDbService } from './interfaces/cosmos-db-service.interface';

/**
 * Base service for Azure Cosmos DB operations
 */
export class BaseCosmosDbService implements CosmosDbService {
  private client: CosmosClient;
  private database: Database | undefined;
  private containers: Map<string, Container> = new Map();

  constructor(private readonly dbName: string) {
    this.client = new CosmosClient({
      connectionString: env.COSMOS_DB_CONNECTION_STRING,
      key: env.COSMOS_DB_KEY,
    });

    logger.info('CosmosDB service initialized');
  }

  /**
   * Initializes the database and containers
   */
  public async initialize(defaultContainer: string): Promise<void> {
    try {
      // Get or create database
      const { database } = await this.client.databases.createIfNotExists({
        id: this.dbName,
      });
      this.database = database;

      // Get or create containers
      await this.getContainer(defaultContainer);

      logger.info('CosmosDB database and containers initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to initialize CosmosDB: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Queries a container
   * @param containerId The ID of the container
   * @param query The SQL query
   * @param parameters The query parameters
   * @returns The query results
   */
  public async queryContainer<T, P extends JSONValue = JSONValue>(
    containerId: string,
    query: string,
    parameters: P[] = []
  ): Promise<T[]> {
    try {
      const container = await this.getContainer(containerId);
      const querySpec: SqlQuerySpec = {
        query,
        parameters: parameters.map((p, i) => ({
          name: `@p${i}`,
          value: p,
        })),
      };

      const { resources } = await container.items.query<T>(querySpec).fetchAll();
      return resources;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to query container ${containerId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gets a container by ID, creating it if it doesn't exist
   * @param containerId The ID of the container
   * @returns The container
   */
  public async getContainer(containerId: string): Promise<Container> {
    if (this.containers.has(containerId)) {
      return this.containers.get(containerId)!;
    }

    try {
      const { container } = await this.database!.containers.createIfNotExists({
        id: containerId,
      });

      this.containers.set(containerId, container);
      return container;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to get container ${containerId}: ${errorMessage}`);
      throw error;
    }
  }
}
