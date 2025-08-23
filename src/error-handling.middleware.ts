import express, { Response } from 'express';
import { logger } from './utils/logger';
import { BaseApiError } from './models/errors';
import { ApiResponse } from './models/dto/response-dto';

export const errorHandlingMiddleware = (
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): Response<unknown, Record<string, unknown>> => {
  // Handle tsoa validation errors
  if (err && typeof err === 'object' && 'status' in err && 'fields' in err) {
    const validationError = err as { status: number; fields: Record<string, unknown> };
    logger.warn('Validation error', { error: validationError });
    const body: ApiResponse<null> = {
      success: false,
      error: JSON.stringify(validationError.fields),
      data: null,
    };

    return res.status(validationError.status).json(body);
  }

  // Handle custom API errors
  if (err instanceof BaseApiError) {
    logger.warn(`${err.name}: ${err.message}`, { error: err });
    const body: ApiResponse<null> = {
      success: false,
      error: err.message,
      data: null,
    };
    return res.status(err.statusCode).json(body);
  }

  // Handle other errors
  logger.error('Unhandled error', { error: err });
  const message = err instanceof Error ? `Internal server error: ${err.message}` : 'Internal server error';
  const body: ApiResponse<null> = {
    success: false,
    error: message,
    data: null,
  };
  return res.status(500).json(body);
};
