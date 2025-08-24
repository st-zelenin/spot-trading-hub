import { cleanEnv, str, port } from 'envalid';

/**
 * Validates and provides type-safe access to environment variables
 */
export const env = cleanEnv(process.env, {
  // Server configuration
  PORT: port({ default: 3000, desc: 'Port for the API server' }),
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),

  // Binance API credentials
  BINANCE_API_KEY: str({ desc: 'Binance API key' }),
  BINANCE_API_SECRET: str({ desc: 'Binance API secret' }),

  // Bybit API credentials
  BYBIT_API_KEY: str({ desc: 'Bybit API key' }),
  BYBIT_API_SECRET: str({ desc: 'Bybit API secret' }),

  // Azure Cosmos DB configuration
  COSMOS_DB_CONNECTION_STRING: str({ desc: 'Azure Cosmos DB endpoint URL' }),
  COSMOS_DB_KEY: str({ desc: 'Azure Cosmos DB access key' }),
  COSMOS_DB_COMMON_CONTAINER_NAME: str({ desc: 'Azure Cosmos DB common container name' }),

  // MongoDB configuration
  MONGO_URI: str({ desc: 'MongoDB connection URI', default: 'mongodb://localhost:27017' }),
  MONGO_DB_NAME: str({ desc: 'MongoDB database name', default: 'binance_bot_db' }),

  // Logging
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
  }),
});
