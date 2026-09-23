import { Router } from 'express';
import { 
    getConflictsController, 
    getConflictByIdController, 
    detectConflictsController, 
    getDashboardStatsController,
} from '../controllers/conflict.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';


const router = Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'super_admin'), getConflictsController);

router.get('/dashboard-stats', authMiddleware, authorizeRoles('admin', 'super_admin'), getDashboardStatsController);

router.get('/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), getConflictByIdController);

router.post('/detect', authMiddleware, authorizeRoles('admin', 'super_admin'), detectConflictsController);

export default router;

