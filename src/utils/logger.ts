import winston from 'winston';
import { env } from '../config/env';

/**
 * Winston logger configuration
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: 'spot-trading-hub' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return (
            `${String(timestamp)} [${String(level)}]: ${String(message)} ` +
            `${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
          );
        })
      ),
    }),
    // File transport for non-development environments
    ...(env.NODE_ENV !== 'development'
      ? [
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});
