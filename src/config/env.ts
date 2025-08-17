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

  // Logging
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
  }),
});
