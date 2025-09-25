import { BaseCosmosDbService } from '../base-cosmos-db.service';

export class BinanceDbService extends BaseCosmosDbService {
  constructor() {
    super('binance', 'symbol');
  }
}

// Singleton instance
export const binanceDbService = new BinanceDbService();
