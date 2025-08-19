import { env } from './config/env';

export const CONTAINER_NAMES = {
  Users: 'users',
  Orders: env.COSMOS_DB_COMMON_CONTAINER_NAME,
};
