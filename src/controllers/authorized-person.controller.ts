import type { Request, Response, NextFunction } from 'express';
import { AuthorizedPersonModel } from '../models/AuthorizedPerson.js';
import {
    ValidationError,
    ConflictError,
    DatabaseError,
} from '../utils/errors.js';

export async function createAuthorizedPerson(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const {
            tipoDocumento,
            numeroDocumento,
            cargo,
            estado,
        } = request.body;

        if (!tipoDocumento || !numeroDocumento || !cargo) {
            throw new ValidationError(
                'Los datos de la persona autorizada son obligatorios.',
            );
        }
        
        const numeroDocumentoNormalizado = String(numeroDocumento).trim();

        if (tipoDocumento === 'PASAPORTE') {

            if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/.test(numeroDocumentoNormalizado)) {
                throw new ValidationError(
                    'El pasaporte debe contener al menos una letra y solo puede contener letras y números.',
                );
            }
        } else if (!/^\d+$/.test(numeroDocumentoNormalizado)) {
                throw new ValidationError(
                    'El número de documento solo puede contener números.',
                );
            }


        if (!String(cargo).trim()) {
            throw new ValidationError(
                'El cargo es obligatorio.',
            );
        }



        const personaExiste = await AuthorizedPersonModel.exists({
            numeroDocumento: numeroDocumentoNormalizado,
        });

        if (personaExiste) {
            throw new ConflictError(
                'Ya existe una persona autorizada con ese número de documento',
                'AuthorizedPerson',
            );
        }

        const authorizedPerson = await AuthorizedPersonModel.create({
            tipoDocumento,
            numeroDocumento: numeroDocumentoNormalizado,
            cargo: String(cargo).trim(),
            estado: estado ?? 'ACTIVO',
        }).catch((error) => {
            console.error('EROR REAL DE MONGO:', error);

            throw new DatabaseError(
                'No fue posible crear la persona autorizada',
                error,
            );
        });

        response.status(201).json({
            success: true,
            message: 'persona autorizada creada correctamente.',
            data: {
                id: authorizedPerson._id,
                tipoDocumento: authorizedPerson.tipoDocumento,
                numeroDocumento: authorizedPerson.numeroDocumento,
                cargo: authorizedPerson.cargo,
                estado: authorizedPerson.estado,
            },
        });
    } catch (error: unknown) {
        next(error);
    }
}