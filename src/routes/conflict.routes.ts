import { Router } from 'express';
import { 
    getConflictsController, 
    getConflictByIdController, 
    detectConflictsController, 
    getDashboardStatsController,
    updateConflictStatusController,
    generateConflictReportController
} from '../controllers/conflict.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';


const router = Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'superAdmin'), getConflictsController);

router.get('/dashboard-stats', authMiddleware, authorizeRoles('admin', 'superAdmin'), getDashboardStatsController);

router.post('/report', authMiddleware, authorizeRoles('admin', 'superAdmin'), generateConflictReportController);

router.get('/:id', authMiddleware, authorizeRoles('admin', 'superAdmin'), getConflictByIdController);

router.post('/detect', authMiddleware, authorizeRoles('admin', 'superAdmin'), detectConflictsController);

router.put('/:id/status', authMiddleware, authorizeRoles('admin', 'superAdmin'), updateConflictStatusController);

export default router;

