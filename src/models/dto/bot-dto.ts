// copy/paste from @binance/spot
// to solve tsoa type error
export interface GetOrderResponse {
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  symbol?: string;
  /**
   *
   * @type {number}
   * @memberof GetOrderResponse
   */
  orderId?: number;
  /**
   *
   * @type {number}
   * @memberof GetOrderResponse
   */
  orderListId?: number;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  clientOrderId?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  price?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  origQty?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  executedQty?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  cummulativeQuoteQty?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  status?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  timeInForce?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  type?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  side?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  stopPrice?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  icebergQty?: string;
  /**
   *
   * @type {number}
   * @memberof GetOrderResponse
   */
  time?: number;
  /**
   *
   * @type {number}
   * @memberof GetOrderResponse
   */
  updateTime?: number;
  /**
   *
   * @type {boolean}
   * @memberof GetOrderResponse
   */
  isWorking?: boolean;
  /**
   *
   * @type {number}
   * @memberof GetOrderResponse
   */
  workingTime?: number;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  origQuoteOrderQty?: string;
  /**
   *
   * @type {string}
   * @memberof GetOrderResponse
   */
  selfTradePreventionMode?: string;
}

export interface BinanceBotOrder extends GetOrderResponse {
  botId: string;
}

export interface BotConfig {
  [key: string]: unknown;
}

export interface BotTradingPair {
  trailingDelta?: number | null;
  [key: string]: unknown;
}

export interface BaseBot {
  config: BotConfig;
  pairs: BotTradingPair[];
}

export interface Bot extends BaseBot {
  id: string;
}

export interface FilledOrderQueueItem {
  botId: string;
  orderId: number;
  symbol: string;
  detailsFetched: boolean;
  createdAt: Date;
  processedAt?: Date;
  type?: 'filled' | 'pending';
}

export type NewFilledOrderQueueItem = Omit<FilledOrderQueueItem, 'createdAt' | 'detailsFetched'>;

export interface PagedData<T> {
  items: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * Request body for updating bottom-weighted bot pairs with sell quote amounts
 * @example { "sellFractionTop": 0.9, "sellFractionBottom": 0.1 }
 */
export interface UpdateBottomWeightedSellQuoteRequest {
  /**
   * Fraction of position to sell at the top (highest price) level, e.g. 0.9
   */
  readonly sellFractionTop: number;
  /**
   * Fraction of position to sell at the bottom (lowest price) level, e.g. 0.1
   */
  readonly sellFractionBottom: number;
}
