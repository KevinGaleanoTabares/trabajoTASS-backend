import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

export function authorizeRoles(...allowedRoles: string[]) {
    return (request: Request, response: Response, next: NextFunction): void => {
        try {
            const user = request.user;

            if (!user) {
                throw new ValidationError('Usuario no autenticado.');
            }

            if(!allowedRoles.includes(user.rolSistema)) {
                response.status(403).json({
                    success: false,
                    message: 'No tienes permisos para realizar esta acción.'
                });

                return;
            }

            next();
            
        } catch (error) {
            next(error);
        }
    };
}