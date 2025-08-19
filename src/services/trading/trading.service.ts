import { env } from '../../config/env';
import { CONTAINER_NAMES } from '../../constants';
import { Trader } from '../../models/dto/user-dto';
import { BaseApiError, CosmosError, NotFoundError } from '../../models/errors';
import { TradingDbService } from './trading-db.service';

export class TradingService {
  constructor(private readonly tradingDbService: TradingDbService) {}

  public async getUser(): Promise<Trader> {
    try {
      const query = 'SELECT * FROM c WHERE c.id = @p0';
      const params = [env.COSMOS_DB_COMMON_CONTAINER_NAME];

      const [user] = await this.tradingDbService.queryContainer<Trader>(CONTAINER_NAMES.Users, query, params);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      throw this.getCosmosError('Failed to get user', error);
    }
  }

  private getCosmosError(baseMessage: string, error: unknown): BaseApiError {
    if (error instanceof BaseApiError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new CosmosError(`${baseMessage}: ${errorMessage}`);
  }
}
