import { ExchangeType } from '../models/exchange';
import { ExchangeService } from './interfaces/exchange-service.interface';
import { BinanceService } from './exchanges/binance.service';
import { logger } from '../utils/logger';
import { ValidationError } from '../models/errors';

/**
 * Factory class for creating exchange service instances
 * Follows the Factory pattern to create appropriate exchange service based on the exchange type
 */
export class ExchangeFactory {
  private static readonly instances: Map<ExchangeType, ExchangeService> = new Map();

  /**
   * Gets an exchange service instance based on the exchange type
   * Uses singleton pattern to reuse existing instances
   * @param exchangeType The type of exchange
   * @returns An instance of ExchangeService
   * @throws ValidationError if the exchange type is not supported
   */
  public static getExchangeService(exchangeType: ExchangeType): ExchangeService {
    if (!this.instances.has(exchangeType)) {
      logger.info(`Creating new exchange service for ${exchangeType}`);

      switch (exchangeType) {
        case ExchangeType.BINANCE:
          this.instances.set(exchangeType, new BinanceService());
          break;
        default:
          throw new ValidationError(`Unsupported exchange type: ${String(exchangeType)}`);
      }
    }

    return this.instances.get(exchangeType)!;
  }
}
