import { Router } from 'express';
import { register } from '../controllers/auth.controller.js';

const asyncHandler = (
  handler: (req: any, res: any, next: any) => Promise<void>,
) => (req: any, res: any, next: any) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const authRouter = Router();
authRouter.post('/register', asyncHandler(register));