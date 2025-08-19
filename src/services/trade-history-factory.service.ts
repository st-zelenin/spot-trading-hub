import { ExchangeType } from '../models/exchange';
import { TradeHistoryService } from './interfaces/trade-history-service.interface';
import { logger } from '../utils/logger';
import { ValidationError } from '../models/errors';
import { BybitTradeHistoryService } from './bybit/bybit-trade-history.service';
import { BinanceTradeHistoryService } from './binance/binance-trade-history.service';
import { bybitDbService } from './bybit/bybit-db.service';
import { binanceDbService } from './binance/binance-db.service';

/**
 * Factory class for creating trade history service instances
 * Follows the Factory pattern to create appropriate trade history service based on the exchange type
 */
export class TradeHistoryFactory {
  private static readonly instances: Map<ExchangeType, TradeHistoryService> = new Map();

  /**
   * Gets a trade history service instance based on the exchange type
   * Uses singleton pattern to reuse existing instances
   * @param exchangeType The type of exchange
   * @returns An instance of TradeHistoryService
   * @throws ValidationError if the exchange type is not supported
   */
  public static getTradeHistoryService(exchangeType: ExchangeType): TradeHistoryService {
    if (!this.instances.has(exchangeType)) {
      logger.info(`Creating new trade history service for ${exchangeType}`);

      switch (exchangeType) {
        case ExchangeType.BINANCE:
          this.instances.set(exchangeType, new BinanceTradeHistoryService(binanceDbService));
          break;
        case ExchangeType.BYBIT:
          this.instances.set(exchangeType, new BybitTradeHistoryService(bybitDbService));
          break;
        default:
          throw new ValidationError(`Unsupported exchange type: ${String(exchangeType)}`);
      }
    }

    return this.instances.get(exchangeType)!;
  }
}
