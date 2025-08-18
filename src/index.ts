import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables first
dotenv.config();

import apiRoutes from './routes';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger';
import { BaseApiError } from './models/errors';
import { ApiResponse } from './models/dto/response-dto';

// Create Express application
const app = express();

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

// Error handling middleware
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
});

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
