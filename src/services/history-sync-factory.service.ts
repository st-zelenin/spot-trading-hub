import { ExchangeType } from '../models/exchange';
import { HistorySyncService } from './interfaces/history-sync-service.interface';
import { BinanceHistorySyncService } from './binance/binance-history-sync-service';
import { BybitHistorySyncService } from './bybit/bybit-history-sync-service';
import { ExchangeFactory } from './exchange-factory.service';
import { logger } from '../utils/logger';
import { ValidationError } from '../models/errors';
import { binanceDbService } from './binance/binance-db.service';
import { bybitDbService } from './bybit/bybit-db.service';
import { TradingService } from './trading/trading.service';

/**
 * Factory for creating history sync service instances based on exchange type
 */
export class HistorySyncFactory {
  private static readonly instances: Map<ExchangeType, HistorySyncService> = new Map();

  /**
   * Get the appropriate history sync service based on exchange type
   * @param exchange The exchange type
   * @returns The history sync service instance
   */
  public static getHistorySyncService(exchange: ExchangeType, tradingService: TradingService): HistorySyncService {
    if (!this.instances.has(exchange)) {
      logger.info(`Creating new history sync service for ${exchange}`);

      const exchangeService = ExchangeFactory.getExchangeService(exchange);

      switch (exchange) {
        case ExchangeType.BINANCE:
          this.instances.set(
            exchange,
            new BinanceHistorySyncService(exchangeService, tradingService, binanceDbService)
          );
          break;
        case ExchangeType.BYBIT:
          this.instances.set(exchange, new BybitHistorySyncService(exchangeService, tradingService, bybitDbService));
          break;
        default:
          throw new ValidationError(`Unsupported exchange type: ${String(exchange)}`);
      }
    }

    return this.instances.get(exchange)!;
  }
}
