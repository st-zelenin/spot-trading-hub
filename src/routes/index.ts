import { Router } from 'express';
import { RegisterRoutes } from './generated/routes';

const router = Router();

/**
 * API Routes - Using tsoa generated routes
 */
RegisterRoutes(router);

export default router;
