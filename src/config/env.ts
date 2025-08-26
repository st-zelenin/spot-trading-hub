import { cleanEnv, str, port, bool } from 'envalid';

/**
 * Validates and provides type-safe access to environment variables
 */
export const env = cleanEnv(process.env, {
  // Server configuration
  PORT: port({ default: 3000, desc: 'Port for the API server' }),
  WEB_SOCKET_PORT: port({ default: 8080, desc: 'Port for the WebSocket server' }),
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  TESTNET: bool({ default: false }),

  // Binance API credentials
  BINANCE_API_KEY: str({ desc: 'Binance API key' }),
  BINANCE_API_SECRET: str({ desc: 'Binance API secret' }),
  BINANCE_TESTNET_API_KEY: str({ desc: 'Binance Testnet API key' }),
  BINANCE_TESTNET_API_SECRET: str({ desc: 'Binance Testnet API secret' }),

  // Bybit API credentials
  BYBIT_API_KEY: str({ desc: 'Bybit API key' }),
  BYBIT_API_SECRET: str({ desc: 'Bybit API secret' }),

  // Azure Cosmos DB configuration
  COSMOS_DB_CONNECTION_STRING: str({ desc: 'Azure Cosmos DB endpoint URL' }),
  COSMOS_DB_KEY: str({ desc: 'Azure Cosmos DB access key' }),
  COSMOS_DB_COMMON_CONTAINER_NAME: str({ desc: 'Azure Cosmos DB common container name' }),

  // MongoDB configuration
  MONGO_URI: str({ desc: 'MongoDB connection URI' }),
  MONGO_DB_NAME: str({ desc: 'MongoDB database name' }),

  // Logging
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
  }),
});
