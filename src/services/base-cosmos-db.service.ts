import {
  CosmosClient,
  Container,
  Database,
  SqlQuerySpec,
  JSONValue,
  ItemDefinition,
  OperationInput,
  BulkOperationType,
} from '@azure/cosmos';
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

  /**
   * Upserts an item in a container
   * @param containerId The ID of the container
   * @param item The item to upsert
   * @returns The upserted item
   */
  public async upsertItem<T extends ItemDefinition>(containerId: string, item: T): Promise<T> {
    try {
      const container = await this.getContainer(containerId);
      const { resource } = await container.items.upsert<T>(item);
      return resource!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to upsert item in container ${containerId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Performs bulk upsert operations on multiple items in a container
   * @param containerId The ID of the container
   * @param items Array of items to upsert
   * @returns Array of successfully upserted items
   */
  public async bulkUpsertItems<T extends ItemDefinition>(containerId: string, items: T[]): Promise<T[]> {
    try {
      if (!items.length) {
        return [];
      }

      const container = await this.getContainer(containerId);

      const operations = items.map<OperationInput>((item) => {
        return {
          operationType: BulkOperationType.Upsert,
          id: item.id,
          resourceBody: item,
        };
      });

      // Execute bulk operations using the recommended method
      const response = await container.items.executeBulkOperations(operations);

      // Process results
      const results: T[] = [];
      for (const result of response) {
        // Check if there's an error in the operation
        if (result.error) {
          logger.error(`Failed to upsert item in bulk operation: ${JSON.stringify(result.error)}`);
        } else if (result.response) {
          // For successful operations, the item is in response.resourceBody
          results.push(result.response.resourceBody as T);
        }
      }

      logger.info(`Bulk upserted ${results.length}/${items.length} items in container ${containerId}`);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to bulk upsert items in container ${containerId}: ${errorMessage}`);
      throw error;
    }
  }
}
