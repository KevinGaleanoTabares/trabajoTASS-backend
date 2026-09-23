import { Router } from "express";
import { getFamilyRelationshipsController, createFamilyRelationshipController } from "../controllers/family-relationship.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/', authMiddleware, getFamilyRelationshipsController);
router.post('/', authMiddleware, createFamilyRelationshipController);

export default router;