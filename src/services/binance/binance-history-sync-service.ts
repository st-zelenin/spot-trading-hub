import { ExchangeService } from '../interfaces/exchange-service.interface';
import { HistorySyncService } from '../interfaces/history-sync-service.interface';
import { logger } from '../../utils/logger';
import { CosmosDbService } from '../interfaces/cosmos-db-service.interface';
import { TradingService } from '../trading/trading.service';

export class BinanceHistorySyncService implements HistorySyncService {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly tradingService: TradingService,
    private readonly ordersDbService: CosmosDbService
  ) {
    console.log('exchangeService', this.exchangeService);
    console.log('tradingService', this.tradingService);
    console.log('ordersDbService', this.ordersDbService);
  }

  public syncRecentSymbolHistory(symbol: string): Promise<void> {
    logger.info(`Sync recent history for symbol ${symbol}`);

    throw new Error('Method not implemented.');
  }

  public async syncRecentHistory(): Promise<void> {
    logger.info('Sync recent history for all symbols');

    const user = await this.tradingService.getUser();

    for (const { symbol } of user.binance) {
      logger.info(`Sync recent history for symbol ${symbol}`);
      await this.syncRecentSymbolHistory(symbol);
    }

    throw new Error('Method not implemented.');
  }

  public syncFullHistory(symbol: string): Promise<void> {
    logger.info(`Sync full history for symbol ${symbol}`);

    throw new Error('Method not implemented.');
  }
}
