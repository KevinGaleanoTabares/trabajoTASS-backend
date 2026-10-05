import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/User.js';

export async function getAdministratorsController(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const administrators = await UserModel.find({ rolSistema: 'admin' })
      .select('nombres apellidos correo tipoVinculacion cargo estado createdAt')
      .sort({ apellidos: 1, nombres: 1 })
      .lean();

    response.status(200).json({
      success: true,
      data: administrators,
    });
  } catch (error) {
    next(error);
  }
}