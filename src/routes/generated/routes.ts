/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../../controllers/user.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrderController } from './../../controllers/order.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TradeHistoryController } from './../../controllers/history.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BinanceBotController } from './../../controllers/binance-bot.controller';
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
    "ExchangeType": {
        "dataType": "refEnum",
        "enums": ["BINANCE","BYBIT"],
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
        const argsBinanceBotController_addBotOrder: Record<string, TsoaRoute.ParameterSchema> = {
                botId: {"in":"path","name":"botId","required":true,"dataType":"string"},
                request: {"in":"body","name":"request","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"symbol":{"dataType":"string","required":true},"orderId":{"dataType":"double","required":true}}},
        };
        app.post('/binance-bot/:botId/order-by-id',
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController)),
            ...(fetchMiddlewares<RequestHandler>(BinanceBotController.prototype.addBotOrder)),

            async function BinanceBotController_addBotOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBinanceBotController_addBotOrder, request, response });

                const controller = new BinanceBotController();

              await templateService.apiHandler({
                methodName: 'addBotOrder',
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
