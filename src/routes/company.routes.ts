import { Router } from 'express';
import { getCompanyByNit } from '../controllers/company.controller.js';
import { createCompany } from '../controllers/create.controller.js';

const asyncHandler = (
  handler: (req: any, res: any, next: any) => Promise<void>,
) => (req: any, res: any, next: any) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const companyRouter = Router();

companyRouter.post('/', asyncHandler(createCompany));
companyRouter.get('/nit/:nit', asyncHandler(getCompanyByNit));
