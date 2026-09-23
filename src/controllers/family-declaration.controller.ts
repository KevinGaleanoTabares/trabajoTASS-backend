import type { Request, Response, NextFunction } from 'express';
import { createFamilyDeclaration } from '../services/family-declaration.service.js';
import { ValidationError } from '../utils/errors.js';

export async function createFamilyDeclarationController(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {

    try {
        
        if (!request.user) {
            throw new ValidationError(
                'Usuario no autenticado.',
            );
        }

        const {
            tipoDocumento,
            numeroDocumento,
            tipoVinculo,
        } = request.body;

        if (!tipoDocumento || !numeroDocumento || !tipoVinculo) {
            throw new ValidationError(
                'Los datos del familiar son obligatorios.',
            );
        }

        const declaracion = await createFamilyDeclaration(
            request.user.id,
            tipoDocumento,
            numeroDocumento,
            tipoVinculo,
        );

        response.status(201).json({
            success: true,
            message: 'Familiar registrado correctamente.',
            data: declaracion,
        });
        console.log('FAMILIAR CREADO', declaracion )

    } catch (error) {
        next(error);
    }
}