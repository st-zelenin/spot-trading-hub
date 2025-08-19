import { ExchangeService } from '../interfaces/exchange-service.interface';
import { HistorySyncService } from '../interfaces/history-sync-service.interface';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';

export class BybitHistorySyncService implements HistorySyncService {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly tradingDbService: CosmosDbService,
    private readonly ordersDbService: CosmosDbService
  ) {
    console.log('exchangeService', this.exchangeService);
    console.log('tradingDbService', this.tradingDbService);
    console.log('ordersDbService', this.ordersDbService);
  }

  public syncRecentSymbolHistory(symbol: string): Promise<void> {
    logger.info(`Sync recent history for symbol ${symbol}`);

    throw new Error('Method not implemented.');
  }

  public syncRecentHistory(): Promise<void> {
    logger.info('Sync recent history for all symbols');

    throw new Error('Method not implemented.');
  }

  public syncFullHistory(symbol: string): Promise<void> {
    logger.info(`Sync full history for symbol ${symbol}`);

    throw new Error('Method not implemented.');
  }
}
