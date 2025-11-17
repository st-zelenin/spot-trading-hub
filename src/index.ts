import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables first
dotenv.config();

import apiRoutes from './routes';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger';
import { bybitDbService } from './services/bybit/bybit-db.service';
import { binanceDbService } from './services/binance/binance-db.service';
import { tradingDbService } from './services/trading/trading-db.service';
import { mongoDbService } from './services/base-mongodb.service';
import { OrderSyncService } from './services/order-sync.service';
import { TradingService } from './services/trading/trading.service';
import { CONTAINER_NAMES } from './constants';
import { errorHandlingMiddleware } from './error-handling.middleware';
import { startBinanceWssServer } from './binance-wss-server';
import { ExchangeType } from './models/exchange';

// Create Express application
const app = express();

// Global reference to sync service for graceful shutdown
let bybitOrderSyncService: OrderSyncService | null = null;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:4201',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandlingMiddleware);

// Start the server
const PORT = env.PORT;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// Initialize all services in proper order
async function initializeServices(): Promise<void> {
  try {
    await Promise.all([
      // Cosmos DB
      binanceDbService.initialize(CONTAINER_NAMES.Orders),
      bybitDbService.initialize(CONTAINER_NAMES.Orders),
      tradingDbService.initialize(CONTAINER_NAMES.Users),

      // MongoDB
      mongoDbService.initialize(),
    ]);
    logger.info('Cosmos DB and MongoDB services initialized successfully');

    startBinanceWssServer(env.WEB_SOCKET_PORT);

    const tradingService = new TradingService(tradingDbService);
    const user = await tradingService.getUser();

    // Start Bybit sync service
    const bybitSymbols = user.bybit?.map((pair) => pair.symbol) || [];
    bybitOrderSyncService = new OrderSyncService(ExchangeType.BYBIT, bybitSymbols);
    bybitOrderSyncService.startSync();

    logger.info('All services initialized and started successfully');
  } catch (error: unknown) {
    logger.error('Failed to initialize services', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Start initialization
void initializeServices();

// Graceful shutdown
// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Closing HTTP server and database connections.');

  server.close(() => logger.info('HTTP server closed.'));

  try {
    // Stop sync service
    if (bybitOrderSyncService) {
      bybitOrderSyncService.stopSync();
      logger.info('Bybit order sync service stopped.');
    }

    await mongoDbService.close();
    logger.info('Database connections closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default app;
