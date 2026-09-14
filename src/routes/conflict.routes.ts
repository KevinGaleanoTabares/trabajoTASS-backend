import { Router } from 'express';
import { getConflictsController, getConflictByIdController, detectConflictsController, getDashboardStatsController } from '../controllers/conflict.controller.js';

const router = Router();


router.get('/', getConflictsController);

router.get('/dashboard-stats', getDashboardStatsController);

router.get('/:id', getConflictByIdController);

router.post('/detect', detectConflictsController);

export default router;