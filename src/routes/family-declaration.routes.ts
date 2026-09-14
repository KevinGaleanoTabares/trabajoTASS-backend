import { Router } from 'express';

import { createFamilyDeclarationController } from '../controllers/family-declaration.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createFamilyDeclarationController,);

export default router;