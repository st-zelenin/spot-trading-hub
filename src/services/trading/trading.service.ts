import { env } from '../../config/env';
import { CONTAINER_NAMES } from '../../constants';
import { CryptoPair } from '../../models/dto/crypto-pair.dto';
import { Trader } from '../../models/dto/user-dto';
import { BaseApiError, CosmosError, NotFoundError, ValidationError } from '../../models/errors';
import { ExchangeType } from '../../models/exchange';
import { TradingDbService } from './trading-db.service';

export class TradingService {
  private readonly ID = env.COSMOS_DB_COMMON_CONTAINER_NAME;

  constructor(private readonly tradingDbService: TradingDbService) {}

  public async getUser(): Promise<Trader> {
    try {
      const container = await this.tradingDbService.getContainer(CONTAINER_NAMES.Users);
      const { resource: user } = await container.item(this.ID, this.ID).read<Trader>();

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      throw this.getCosmosError('Failed to get user', error);
    }
  }

  /**
   * Update user data
   * @param user The user data to update
   * @returns The updated user data
   */
  private async updateUser(user: Trader): Promise<Trader> {
    try {
      const container = await this.tradingDbService.getContainer(CONTAINER_NAMES.Users);
      const { resource } = await container.item(this.ID, this.ID).replace(user);

      if (!resource) {
        throw new NotFoundError(`Failed to replace item ${this.ID}: Resource not found`);
      }

      return resource;
    } catch (error) {
      throw this.getCosmosError('Failed to update user', error);
    }
  }

  private getCosmosError(baseMessage: string, error: unknown): BaseApiError {
    if (error instanceof BaseApiError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new CosmosError(`${baseMessage}: ${errorMessage}`);
  }

  /**
   * Remove a cryptocurrency pair from user's list
   */
  public async removePair(exchange: ExchangeType, symbol: string): Promise<Trader> {
    const user = await this.getUser();
    const currentPairs = this.getExchangePairs(exchange, user);

    const pairIndex = currentPairs.findIndex((p) => p.symbol === symbol);
    if (pairIndex === -1) {
      throw new ValidationError(`Pair not found: ${symbol}`);
    }

    const updatedPairs = [...currentPairs];
    updatedPairs.splice(pairIndex, 1);

    this.updateUserPairs(exchange, user, updatedPairs);
    return this.updateUser(user);
  }

  /**
   * Add a cryptocurrency pair to user's list
   */
  public async addPair(exchange: ExchangeType, symbol: string): Promise<Trader> {
    const user = await this.getUser();
    const currentPairs = this.getExchangePairs(exchange, user);

    const existingPair = currentPairs.find((p) => p.symbol === symbol);
    if (existingPair) {
      throw new ValidationError(`Pair already exists: ${symbol}`);
    }

    const newPair: CryptoPair = {
      symbol: symbol,
      isArchived: false,
    };

    const updatedPairs = [...currentPairs, newPair];
    this.updateUserPairs(exchange, user, updatedPairs);
    return this.updateUser(user);
  }

  /**
   * Order cryptocurrency pairs according to user preference
   */
  public async orderPairs(exchange: ExchangeType, orderedSymbols: string[]): Promise<Trader> {
    const user = await this.getUser();

    const pairs = this.getExchangePairs(exchange, user);
    if (!pairs || pairs.length !== orderedSymbols.length) {
      throw new ValidationError(
        `Original and ordered pairs count mismatch: ${pairs?.length || 0} != ${orderedSymbols.length}`
      );
    }

    const orderedPairs = this.orderCryptoPairs(orderedSymbols, pairs);
    this.updateUserPairs(exchange, user, orderedPairs);
    return this.updateUser(user);
  }

  /**
   * Get cryptocurrency pairs for the specified exchange
   */
  private getExchangePairs(exchange: ExchangeType, user: Trader): CryptoPair[] {
    switch (exchange) {
      case ExchangeType.BINANCE:
        return user.binance || [];
      case ExchangeType.BYBIT:
        return user.bybit || [];
      default:
        throw new ValidationError(`Unsupported exchange: ${exchange as string}`);
    }
  }

  /**
   * Order cryptocurrency pairs according to user preference
   */
  private orderCryptoPairs(orderedSymbols: string[], originalPairs: CryptoPair[]): CryptoPair[] {
    const updated: CryptoPair[] = [];

    for (const symbol of orderedSymbols) {
      const pair = originalPairs.find((p) => p.symbol === symbol);
      if (!pair) {
        throw new ValidationError(`Symbol not found in the original pairs: ${symbol}`);
      }

      updated.push(pair);
    }

    return updated;
  }

  /**
   * Update user's cryptocurrency pairs for the specified exchange
   */
  private updateUserPairs(exchange: ExchangeType, user: Trader, orderedPairs: CryptoPair[]): void {
    switch (exchange) {
      case ExchangeType.BINANCE:
        user.binance = orderedPairs;
        break;
      case ExchangeType.BYBIT:
        user.bybit = orderedPairs;
        break;
      default:
        throw new ValidationError(`Unsupported exchange: ${exchange as string}`);
    }
  }
}
