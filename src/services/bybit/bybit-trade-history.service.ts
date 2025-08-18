import { TradeHistoryService } from '../interfaces/trade-history-service.interface';
import { TradeHistory } from '../../models/trade-history';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { bybitDbService } from './bybit-db.service';

/**
 * Bybit-specific implementation of the TradeHistoryService
 */
export class BybitTradeHistoryService implements TradeHistoryService {
  /**
   * Gets trade history from Bybit container in Cosmos DB
   * @param symbol Required symbol to filter trades
   * @returns Array of trade history objects
   */
  public async getTradeHistory(symbol: string): Promise<TradeHistory[]> {
    try {
      const query = 'SELECT * FROM c WHERE c.symbol = @p0 AND c.status = "FILLED" ORDER BY c.updateTime DESC';
      const parameters: (string | number)[] = [symbol];

      const results = await bybitDbService.queryContainer<BybitTradeRecord>(
        env.COSMOS_DB_COMMON_CONTAINER_NAME,
        query,
        parameters
      );

      // Map Bybit-specific records to the unified TradeHistory model
      return results.map((t) => this.mapToTradeHistory(t));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to get Bybit trade history: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Maps a Bybit trade record to the unified TradeHistory model
   * @param record The Bybit trade record
   * @returns A TradeHistory object
   */
  private mapToTradeHistory(record: BybitTradeRecord): TradeHistory {
    return {
      id: record.execId,
      symbol: record.symbol,
      price: parseFloat(record.execPrice),
      quantity: parseFloat(record.execQty),
      quoteQuantity: parseFloat(record.execValue),
      time: new Date(record.execTime),
      isBuyer: record.side.toLowerCase() === 'buy',
      isMaker: record.feeRate.startsWith('-'), // Negative fee rate indicates maker (rebate)
      fee: parseFloat(record.execFee),
      feeAsset: record.feeCurrency,
      orderId: record.orderId,
      clientOrderId: record.orderLinkId,
    };
  }
}

/**
 * Interface representing the structure of Bybit trade records in Cosmos DB
 */
interface BybitTradeRecord {
  execId: string;
  symbol: string;
  execPrice: string;
  execQty: string;
  execValue: string;
  execTime: number;
  side: string;
  feeRate: string;
  execFee: string;
  feeCurrency: string;
  orderId: string;
  orderLinkId: string;
}
