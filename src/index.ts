import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables first
dotenv.config();

import apiRoutes from './routes';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger';

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
    return res.status(validationError.status).json({
      success: false,
      message: 'Validation failed',
      errors: validationError.fields,
    });
  }

  // Handle other errors
  logger.error('Unhandled error', { error: err });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
