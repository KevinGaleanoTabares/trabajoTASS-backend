import type { Request, Response } from 'express';
import { findCompanyByNit } from '../services/company.service.js';

export const getCompanyByNit = async (req: Request, res: Response): Promise<void> => {
    
  const { nit } = req.params;
  console.log('NIT recibido:', nit);

  if (typeof nit !== 'string') {
    res.status(400).json({
      success: false,
      message: 'El NIT es requerido.',
    });
    return;
  }

  const company = await findCompanyByNit(nit);

  if (!company) {
    res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: 'No existe una empresa con ese NIT.',
    });
    return;
  }

  res.json({
    success: true,
    data: company,
  });
};