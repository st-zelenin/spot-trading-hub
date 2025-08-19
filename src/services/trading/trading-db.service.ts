import { BaseCosmosDbService } from '../base-cosmos-db.service';

export class TradingDbService extends BaseCosmosDbService {
  constructor() {
    super('trading');
  }
}

// Singleton instance
export const tradingDbService = new TradingDbService();
