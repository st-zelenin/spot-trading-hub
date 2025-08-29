export class BaseApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends BaseApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ExchangeError extends BaseApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class CosmosError extends BaseApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class MongoDbError extends BaseApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UserError extends BaseApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InternalServerError extends BaseApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}
