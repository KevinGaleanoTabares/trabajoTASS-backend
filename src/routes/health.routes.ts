import { Router, type Response } from 'express';
import mongoose from 'mongoose';
import { logError } from '../utils/logger.js';

export function createHealthRouter(
  connection: Pick<mongoose.Connection, 'readyState' | 'db'> = mongoose.connection,
) {
  const router = Router();

  router.get('/', async (_request, response: Response) => {
    if (connection.readyState !== 1 || !connection.db) {
      response.status(503).json({
        status: 'unavailable',
        database: 'unavailable',
      });
      return;
    }

    try {
      await connection.db.admin().ping();
      response.status(200).json({
        status: 'ok',
        database: 'connected',
      });
    } catch (error) {
      logError('health.mongo.ping_failed', error);
      response.status(503).json({
        status: 'unavailable',
        database: 'unavailable',
      });
    }
  });

  return router;
}

export const healthRouter = createHealthRouter();
