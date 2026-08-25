import type { Request, Response } from 'express';
import { CompanyModel } from '../models/company.js';

export const createCompany = async (
  req: Request,
  res: Response,
): Promise<void> => {

  const { nit, nombre } = req.body;

  const company = await CompanyModel.create({
    nit,
    nombre,
  });

  res.status(201).json({
    success: true,
    data: company,
  });
};