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
  [key: string]: unknown;
}

export interface BaseBot {
  config: BotConfig;
  pairs: BotTradingPair[];
  orderPendingDetails: number[];
}

export interface Bot extends BaseBot {
  id: string;
}
