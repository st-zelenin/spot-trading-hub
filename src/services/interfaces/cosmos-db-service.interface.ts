import { ItemDefinition, JSONValue } from '@azure/cosmos';

export interface CosmosDbService {
  queryContainer<T, P extends JSONValue = JSONValue>(containerId: string, query: string, parameters: P[]): Promise<T[]>;
  upsertItem<T extends ItemDefinition>(containerId: string, item: T): Promise<T>;
  bulkUpsertItems<T extends ItemDefinition>(containerId: string, items: T[]): Promise<T[]>;
}
