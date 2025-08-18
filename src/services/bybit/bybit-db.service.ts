import { BaseCosmosDbService } from '../base-cosmos-db.service';

export class BybitDbService extends BaseCosmosDbService {
  constructor() {
    super('bybit');
  }
}

// Singleton instance
export const bybitDbService = new BybitDbService();
