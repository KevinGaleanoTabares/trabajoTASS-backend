import { Router } from 'express';
import { getAdministratorsController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/administrators',
  authMiddleware,
  authorizeRoles('superAdmin'),
  getAdministratorsController,
);

export default router;