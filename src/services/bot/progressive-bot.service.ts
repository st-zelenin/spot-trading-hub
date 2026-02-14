import { BotDbService } from './bot-db.service';
import { BotTradingPair, ProgressiveBot } from '../../models/dto/bot-dto';
import { ValidationError } from '../../models/errors';

export class ProgressiveBotService {
  constructor(private readonly botDbService: BotDbService) {}

  /**
   * Consolidates the top (highest sellPrice) pairs into one consolidated order,
   * reduces numPairs by count, and saves the remaining pairs.
   * @param botId The bot ID
   * @param count Number of pairs to consolidate
   */
  public async consolidateTopPairs(botId: string, count: number): Promise<void> {
    const bot = (await this.botDbService.getBot(botId)) as unknown as ProgressiveBot;

    if (bot.config.botType !== 'progressive') {
      throw new ValidationError('Bot is not a progressive bot');
    }

    const numPairs = bot.config.numPairs;
    if (numPairs <= count) {
      throw new ValidationError('config.numPairs must be greater than count');
    }

    if (bot.pairs.length <= count) {
      throw new ValidationError('pairs.length must be greater than count');
    }

    const sortedPairs = [...bot.pairs].sort((a, b) => a.sellPrice - b.sellPrice);

    const pairWithHighestSellPrice = sortedPairs[sortedPairs.length - 1];
    const sellPrice = pairWithHighestSellPrice.sellPrice;
    const quoteQuantity = bot.config.amountToBuy * count;

    await this.botDbService.insertConsolidatedOrder({
      botId,
      sellPrice,
      quoteQuantity,
    });

    const remainingPairs = sortedPairs.slice(0, -count);

    await this.botDbService.updateBot(botId, {
      config: { numPairs: bot.config.numPairs - count },
      pairs: remainingPairs as unknown as BotTradingPair[],
    });
  }
}
