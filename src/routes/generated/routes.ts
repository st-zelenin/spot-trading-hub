/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../../controllers/user.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TradingPairController } from './../../controllers/trading-pair.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrderController } from './../../controllers/order.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TradeHistoryController } from './../../controllers/history.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ExchangeController } from './../../controllers/exchange.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BinanceBotController } from './../../controllers/binance-bot.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminController } from './../../controllers/admin.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "CryptoPair": {
        "dataType": "refObject",
        "properties": {
            "symbol": {"dataType":"string","required":true},
            "isArchived": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Trader": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "gate": {"dataType":"array","array":{"dataType":"refObject","ref":"CryptoPair"},"required":true},
            "crypto": {"dataType":"array","array":{"dataType":"refObject","ref":"CryptoPair"},"required":true},
            "coinbase": {"dataType":"array","array":{"dataType":"refObject","ref":"CryptoPair"},"required":true},
            "bybit": {"dataType":"array","array":{"dataType":"refObject","ref":"CryptoPair"},"required":true},
            "binance": {"dataType":"array","array":{"dataType":"refObject","ref":"CryptoPair"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Trader_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"Trader"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExchangeType": {
        "dataType": "refEnum",
        "enums": ["BINANCE","BYBIT"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderedSymbols": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbols": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TradingPair": {
        "dataType": "refObject",
        "properties": {
            "buyPrice": {"dataType":"double","required":true},
            "sellPrice": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "buyFilled": {"dataType":"boolean","required":true},
            "buyOrderId": {"dataType":"double"},
            "sellOrderId": {"dataType":"double"},
            "trailingDelta": {"dataType":"double"},
            "sellQuoteAmount": {"dataType":"double"},
            "id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TradingPair-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"TradingPair"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NewTradingPair": {
        "dataType": "refObject",
        "properties": {
            "buyPrice": {"dataType":"double","required":true},
            "sellPrice": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "buyFilled": {"dataType":"boolean","required":true},
            "buyOrderId": {"dataType":"double"},
            "sellOrderId": {"dataType":"double"},
            "trailingDelta": {"dataType":"double"},
            "sellQuoteAmount": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TradingPair_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"TradingPair"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_unknown_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"enum","enums":[null]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CancelOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "orderId": {"dataType":"string","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CancelAllOrdersRequest": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_string-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TrailingTakeProfitLimitSellOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbol": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "limitPrice": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_unknown-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"any"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_string_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlaceLimitOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "side": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["buy"]},{"dataType":"enum","enums":["sell"]}],"required":true},
            "price": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlaceMarketOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "side": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["buy"]},{"dataType":"enum","enums":["sell"]}],"required":true},
            "total": {"dataType":"double","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TradeHistoryRequestDto": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbol": {"dataType":"string","required":true},
            "limit": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TradeHistory": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "symbol": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "quantity": {"dataType":"double","required":true},
            "quoteQuantity": {"dataType":"double","required":true},
            "time": {"dataType":"datetime","required":true},
            "isBuyer": {"dataType":"boolean","required":true},
            "isMaker": {"dataType":"boolean","required":true},
            "fee": {"dataType":"double"},
            "feeAsset": {"dataType":"string"},
            "orderId": {"dataType":"string","required":true},
            "clientOrderId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TradeHistory-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"TradeHistory"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateRecentHistoryRequest": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SyncFullHistoryRequest": {
        "dataType": "refObject",
        "properties": {
            "exchange": {"ref":"ExchangeType","required":true},
            "symbol": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ticker": {
        "dataType": "refObject",
        "properties": {
            "last": {"dataType":"double","required":true},
            "changePercentage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.Ticker_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Ticker"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Record_string.Ticker__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"Record_string.Ticker_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Product": {
        "dataType": "refObject",
        "properties": {
            "currencyPair": {"dataType":"string","required":true},
            "minQuantity": {"dataType":"double","required":true},
            "minTotal": {"dataType":"double","required":true},
            "pricePrecision": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Product-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Product"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SymbolInfo": {
        "dataType": "refObject",
        "properties": {
            "baseAsset": {"dataType":"string","required":true},
            "quoteAsset": {"dataType":"string","required":true},
            "stepSize": {"dataType":"string","required":true},
            "tickSize": {"dataType":"string","required":true},
            "minNotional": {"dataType":"double","required":true},
            "quotePrecision": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SymbolInfo_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"SymbolInfo"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BinanceBotOrder": {
        "dataType": "refObject",
        "properties": {
            "symbol": {"dataType":"string"},
            "orderId": {"dataType":"double"},
            "orderListId": {"dataType":"double"},
            "clientOrderId": {"dataType":"string"},
            "price": {"dataType":"string"},
            "origQty": {"dataType":"string"},
            "executedQty": {"dataType":"string"},
            "cummulativeQuoteQty": {"dataType":"string"},
            "status": {"dataType":"string"},
            "timeInForce": {"dataType":"string"},
            "type": {"dataType":"string"},
            "side": {"dataType":"string"},
            "stopPrice": {"dataType":"string"},
            "icebergQty": {"dataType":"string"},
            "time": {"dataType":"double"},
            "updateTime": {"dataType":"double"},
            "isWorking": {"dataType":"boolean"},
            "workingTime": {"dataType":"double"},
            "origQuoteOrderQty": {"dataType":"string"},
            "selfTradePreventionMode": {"dataType":"string"},
            "botId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BinanceBotOrder-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BinanceBotOrder"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConsolidatedOrder": {
        "dataType": "refObject",
        "properties": {
            "botId": {"dataType":"string","required":true},
            "sellPrice": {"dataType":"double","required":true},
            "quoteQuantity": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ConsolidatedOrder-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"ConsolidatedOrder"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagedData_BinanceBotOrder_": {
        "dataType": "refObject",
        "properties": {
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"BinanceBotOrder"},"required":true},
            "total": {"dataType":"double","required":true},
            "pageNum": {"dataType":"double","required":true},
            "pageSize": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PagedData_BinanceBotOrder__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"PagedData_BinanceBotOrder_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BotConfig": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BotTradingPair": {
        "dataType": "refObject",
        "properties": {
            "trailingDelta": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Bot": {
        "dataType": "refObject",
        "properties": {
            "config": {"ref":"BotConfig","required":true},
            "pairs": {"dataType":"array","array":{"dataType":"refObject","ref":"BotTradingPair"},"required":true},
            "id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Bot_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"Bot"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConsolidatePairsRequest": {
        "dataType": "refObject",
        "properties": {
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateBottomWeightedSellQuoteRequest": {
        "dataType": "refObject",
        "properties": {
            "sellFractionTop": {"dataType":"double","required":true},
            "sellFractionBottom": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Bot-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Bot"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderStatistics": {
        "dataType": "refObject",
        "properties": {
            "buyOrdersCount": {"dataType":"double","required":true},
            "sellOrdersCount": {"dataType":"double","required":true},
            "totalBuyAmount": {"dataType":"double","required":true},
            "totalSellAmount": {"dataType":"double","required":true},
            "profitLoss": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_OrderStatistics_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"OrderStatistics"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BinanceBotOrder_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"BinanceBotOrder"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__ordersDeleted-number--testnetOrdersDeleted-number--filledOrdersQueueDeleted-number--testnetFilledOrdersQueueDeleted-number--botDeleted-boolean__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"botDeleted":{"dataType":"boolean","required":true},"testnetFilledOrdersQueueDeleted":{"dataType":"double","required":true},"filledOrdersQueueDeleted":{"dataType":"double","required":true},"testnetOrdersDeleted":{"dataType":"double","required":true},"ordersDeleted":{"dataType":"double","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MigrationResult": {
        "dataType": "refObject",
        "properties": {
            "ordersProcessed": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MigrationResult_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "error": {"dataType":"string"},
            "data": {"ref":"MigrationResult"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MigrateSymbolRequest": {
        "dataType": "refObject",
        "properties": {
            "from": {"dataType":"string","required":true},
            "to": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUserController_getUser: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/user',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUser)),

            async function UserController_getUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_orderPairs: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"OrderedSymbols"},
        };
        app.post('/user/pairs/order',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.orderPairs)),

            async function UserController_orderPairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_orderPairs, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'orderPairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_addPair: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
                symbol: {"in":"path","name":"symbol","required":true,"dataType":"string"},
        };
        app.post('/user/pairs/add/:exchange/:symbol',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.addPair)),

            async function UserController_addPair(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_addPair, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'addPair',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_removePair: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
                symbol: {"in":"path","name":"symbol","required":true,"dataType":"string"},
        };
        app.delete('/user/pairs/remove/:exchange/:symbol',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.removePair)),

            async function UserController_removePair(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_removePair, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'removePair',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradingPairController_getAllTradingPairs: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"query","name":"botId","required":true,"dataType":"string"},
        };
        app.get('/trading-pairs',
            ...(fetchMiddlewares<RequestHandler>(TradingPairController)),
            ...(fetchMiddlewares<RequestHandler>(TradingPairController.prototype.getAllTradingPairs)),

            async function TradingPairController_getAllTradingPairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradingPairController_getAllTradingPairs, request, response });

                const controller = new TradingPairController();

              await templateService.apiHandler({
                methodName: 'getAllTradingPairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradingPairController_createTradingPairs: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"query","name":"botId","required":true,"dataType":"string"},
                pairs: {"in":"body","name":"pairs","required":true,"dataType":"array","array":{"dataType":"refObject","ref":"NewTradingPair"}},
        };
        app.post('/trading-pairs',
            ...(fetchMiddlewares<RequestHandler>(TradingPairController)),
            ...(fetchMiddlewares<RequestHandler>(TradingPairController.prototype.createTradingPairs)),

            async function TradingPairController_createTradingPairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradingPairController_createTradingPairs, request, response });

                const controller = new TradingPairController();

              await templateService.apiHandler({
                methodName: 'createTradingPairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradingPairController_updateTradingPair: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"TradingPair"},
        };
        app.put('/trading-pairs/:id',
            ...(fetchMiddlewares<RequestHandler>(TradingPairController)),
            ...(fetchMiddlewares<RequestHandler>(TradingPairController.prototype.updateTradingPair)),

            async function TradingPairController_updateTradingPair(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradingPairController_updateTradingPair, request, response });

                const controller = new TradingPairController();

              await templateService.apiHandler({
                methodName: 'updateTradingPair',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getExchangeRawOrder: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"query","name":"exchange","required":true,"ref":"ExchangeType"},
                orderId: {"in":"query","name":"orderId","required":true,"dataType":"string"},
                symbol: {"in":"query","name":"symbol","required":true,"dataType":"string"},
        };
        app.get('/order',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getExchangeRawOrder)),

            async function OrderController_getExchangeRawOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getExchangeRawOrder, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getExchangeRawOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_cancelOrder: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CancelOrderRequest"},
        };
        app.post('/order/cancel',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.cancelOrder)),

            async function OrderController_cancelOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_cancelOrder, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'cancelOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_cancelAllOrders: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CancelAllOrdersRequest"},
        };
        app.post('/order/cancel-all',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.cancelAllOrders)),

            async function OrderController_cancelAllOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_cancelAllOrders, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'cancelAllOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_placeTrailingTakeProfitLimitSellOrder: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"TrailingTakeProfitLimitSellOrderRequest"},
        };
        app.post('/order/trailing-sell',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.placeTrailingTakeProfitLimitSellOrder)),

            async function OrderController_placeTrailingTakeProfitLimitSellOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_placeTrailingTakeProfitLimitSellOrder, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'placeTrailingTakeProfitLimitSellOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getAllOpenOrders: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"query","name":"exchange","required":true,"ref":"ExchangeType"},
        };
        app.get('/order/open',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getAllOpenOrders)),

            async function OrderController_getAllOpenOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getAllOpenOrders, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getAllOpenOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_placeLimitOrder: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
                request: {"in":"body","name":"request","required":true,"ref":"PlaceLimitOrderRequest"},
        };
        app.post('/order/:exchange/limit',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.placeLimitOrder)),

            async function OrderController_placeLimitOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_placeLimitOrder, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'placeLimitOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_placeMarketOrder: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
                request: {"in":"body","name":"request","required":true,"ref":"PlaceMarketOrderRequest"},
        };
        app.post('/order/:exchange/market',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.placeMarketOrder)),

            async function OrderController_placeMarketOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_placeMarketOrder, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'placeMarketOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradeHistoryController_getUserTrades: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"TradeHistoryRequestDto"},
        };
        app.post('/history/user-trades',
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController.prototype.getUserTrades)),

            async function TradeHistoryController_getUserTrades(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradeHistoryController_getUserTrades, request, response });

                const controller = new TradeHistoryController();

              await templateService.apiHandler({
                methodName: 'getUserTrades',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradeHistoryController_getTradeHistory: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"query","name":"exchange","required":true,"ref":"ExchangeType"},
                symbol: {"in":"query","name":"symbol","required":true,"dataType":"string"},
        };
        app.get('/history/history',
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController.prototype.getTradeHistory)),

            async function TradeHistoryController_getTradeHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradeHistoryController_getTradeHistory, request, response });

                const controller = new TradeHistoryController();

              await templateService.apiHandler({
                methodName: 'getTradeHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradeHistoryController_updateRecentHistory: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateRecentHistoryRequest"},
        };
        app.post('/history/recent',
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController.prototype.updateRecentHistory)),

            async function TradeHistoryController_updateRecentHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradeHistoryController_updateRecentHistory, request, response });

                const controller = new TradeHistoryController();

              await templateService.apiHandler({
                methodName: 'updateRecentHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTradeHistoryController_syncFullHistory: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SyncFullHistoryRequest"},
        };
        app.post('/history/sync-full',
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TradeHistoryController.prototype.syncFullHistory)),

            async function TradeHistoryController_syncFullHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTradeHistoryController_syncFullHistory, request, response });

                const controller = new TradeHistoryController();

              await templateService.apiHandler({
                methodName: 'syncFullHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExchangeController_getTraderTickers: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
        };
        app.get('/exchange/:exchange/trader-tickers',
            ...(fetchMiddlewares<RequestHandler>(ExchangeController)),
            ...(fetchMiddlewares<RequestHandler>(ExchangeController.prototype.getTraderTickers)),

            async function ExchangeController_getTraderTickers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExchangeController_getTraderTickers, request, response });

                const controller = new ExchangeController();

              await templateService.apiHandler({
                methodName: 'getTraderTickers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExchangeController_getProducts: Record<string, TsoaRoute.ParameterSchema> = {
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
        };
        app.get('/exchange/:exchange/products',
            ...(fetchMiddlewares<RequestHandler>(ExchangeController)),
            ...(fetchMiddlewares<RequestHandler>(ExchangeController.prototype.getProducts)),

            async function ExchangeController_getProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExchangeController_getProducts, request, response });

                const controller = new ExchangeController();

              await templateService.apiHandler({
                methodName: 'getProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExchangeController_getSymbolInfo: Record<string, TsoaRoute.ParameterSchema> = {
                symbol: {"in":"path","name":"symbol","required":true,"dataType":"string"},
                exchange: {"in":"path","name":"exchange","required":true,"ref":"ExchangeType"},
        };
        app.get('/exchange/:exchange/symbol/:symbol',
            ...(fetchMiddlewares<RequestHandler>(ExchangeController)),
            ...(fetchMiddlewares<RequestHandler>(ExchangeController.prototype.getSymbolInfo)),

            async function ExchangeController_getSymbolInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExchangeController_getSymbolInfo, request, response });

                const controller = new ExchangeController();

              await templateService.apiHandler({
                methodName: 'getSymbolInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getBotOrders: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
        };
        app.get('/binance-bot/:botId/orders',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getBotOrders)),

            async function BinanceBotController_getBotOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getBotOrders, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getBotOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getConsolidatedOrdersLowestByBot: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/binance-bot/consolidated-orders/lowest-by-bot',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getConsolidatedOrdersLowestByBot)),

            async function BinanceBotController_getConsolidatedOrdersLowestByBot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getConsolidatedOrdersLowestByBot, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getConsolidatedOrdersLowestByBot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getAllOrders: Record<string, TsoaRoute.ParameterSchema> = {
                pageNum: {"in":"query","name":"pageNum","required":true,"dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","required":true,"dataType":"double"},
                side: {"in":"query","name":"side","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["BUY"]},{"dataType":"enum","enums":["SELL"]}]},
                botId: {"in":"query","name":"botId","dataType":"string"},
        };
        app.get('/binance-bot/orders',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getAllOrders)),

            async function BinanceBotController_getAllOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getAllOrders, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getAllOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getBot: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
        };
        app.get('/binance-bot/:botId',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getBot)),

            async function BinanceBotController_getBot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getBot, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getBot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_updateBotConfig: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                config: {"in":"body","name":"config","required":true,"ref":"BotConfig"},
        };
        app.put('/binance-bot/:botId/config',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.updateBotConfig)),

            async function BinanceBotController_updateBotConfig(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_updateBotConfig, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'updateBotConfig',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_updateBotPairs: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                pairs: {"in":"body","name":"pairs","required":true,"dataType":"array","array":{"dataType":"refObject","ref":"BotTradingPair"}},
        };
        app.put('/binance-bot/:botId/pairs',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.updateBotPairs)),

            async function BinanceBotController_updateBotPairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_updateBotPairs, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'updateBotPairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_updateBotNumPairs: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"numPairs":{"dataType":"double","required":true}}},
        };
        app.put('/binance-bot/:botId/num-pairs',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.updateBotNumPairs)),

            async function BinanceBotController_updateBotNumPairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_updateBotNumPairs, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'updateBotNumPairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_consolidatePairs: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"ConsolidatePairsRequest"},
        };
        app.put('/binance-bot/:botId/consolidate-pairs',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.consolidatePairs)),

            async function BinanceBotController_consolidatePairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_consolidatePairs, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'consolidatePairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_updateBottomWeightedPairsSellQuote: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateBottomWeightedSellQuoteRequest"},
        };
        app.put('/binance-bot/:botId/bottom-weighted-pairs/update-sell-quote',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.updateBottomWeightedPairsSellQuote)),

            async function BinanceBotController_updateBottomWeightedPairsSellQuote(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_updateBottomWeightedPairsSellQuote, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'updateBottomWeightedPairsSellQuote',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_createBot: Record<string, TsoaRoute.ParameterSchema> = {
                config: {"in":"body","name":"config","required":true,"ref":"BotConfig"},
        };
        app.post('/binance-bot',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.createBot)),

            async function BinanceBotController_createBot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_createBot, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'createBot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getAllBots: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/binance-bot',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getAllBots)),

            async function BinanceBotController_getAllBots(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getAllBots, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getAllBots',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getOrderStatistics: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/binance-bot/statistics/all',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getOrderStatistics)),

            async function BinanceBotController_getOrderStatistics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getOrderStatistics, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getOrderStatistics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_getBotStatistics: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
        };
        app.get('/binance-bot/:botId/statistics',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.getBotStatistics)),

            async function BinanceBotController_getBotStatistics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_getBotStatistics, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'getBotStatistics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_addBotFilledOrder: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                request: {"in":"body","name":"request","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"symbol":{"dataType":"string","required":true},"orderId":{"dataType":"double","required":true}}},
        };
        app.post('/binance-bot/:botId/filled-order',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.addBotFilledOrder)),

            async function BinanceBotController_addBotFilledOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_addBotFilledOrder, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'addBotFilledOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_insertFilledOrderQueue: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                request: {"in":"body","name":"request","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"symbol":{"dataType":"string","required":true},"orderId":{"dataType":"double","required":true}}},
        };
        app.post('/binance-bot/:botId/pending-order',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.insertFilledOrderQueue)),

            async function BinanceBotController_insertFilledOrderQueue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_insertFilledOrderQueue, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'insertFilledOrderQueue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBinanceBotController_cleanupTestnetBot: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
        };
        app.delete('/binance-bot/cleanup/testnet/:botId',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.cleanupTestnetBot)),

            async function BinanceBotController_cleanupTestnetBot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_cleanupTestnetBot, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'cleanupTestnetBot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_migrateSymbol: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"MigrateSymbolRequest"},
        };
        app.post('/admin/migrate-symbol',
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.migrateSymbol)),

            async function AdminController_migrateSymbol(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_migrateSymbol, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'migrateSymbol',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
