import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt.service.js';
import { ValidationError } from '../utils/errors.js';
import type { JwtPayload } from '../utils/enums_types_interfaces.js';
import jwt from 'jsonwebtoken';

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {

  try {

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new ValidationError(
        'Token de autenticación requerido.',
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ValidationError(
        'Formato de token inválido.',
      );
    }

    const payload = verifyToken(token) as JwtPayload;

    console.log('USUARIO AUTENTICADO:', payload)

    request.user = payload;

    next();

  } catch (error) {
    if(error instanceof jwt.TokenExpiredError) {
      response.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'La sesión ha expirado.'
      });

      return;
    }

    next(error);
  }
}