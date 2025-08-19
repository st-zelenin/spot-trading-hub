import { JSONValue } from '@azure/cosmos';

export interface CosmosDbService {
  queryContainer<T, P extends JSONValue = JSONValue>(containerId: string, query: string, parameters: P[]): Promise<T[]>;
}
