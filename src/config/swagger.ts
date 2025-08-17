import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Swagger configuration for API documentation
 */
export const setupSwagger = (app: Express): void => {
  // Use the tsoa-generated swagger.json file
  const swaggerPath = path.join(__dirname, '../../swagger.json');

  // Check if the swagger.json file exists
  if (!fs.existsSync(swaggerPath)) {
    console.warn('swagger.json not found. Run "npm run tsoa:generate" to create it.');
    return;
  }
  // Load the Swagger document
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8')) as swaggerUi.JsonObject;

  // Setup Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
