import type { Request, Response } from 'express';
import { getFamilyRelationships, createFamilyRelationship } from '../services/family-relationship.service.js';

export async function getFamilyRelationshipsController(request: Request, response: Response) {

    if (!request.user) {
        return response.status(401).json({
            success: false,
            message: 'falta información correcta para el usuario',
            messagew: console.log("falta el id del usuario")

        });   
    }

    const userId = request.user.id;

    const familyRelationShips = await getFamilyRelationships(userId);

    return response.status(200).json({
        success: true,
        data: familyRelationShips
    });
}

export async function createFamilyRelationshipController(request: Request, response: Response) {

    const userId = request.user?.id;

    if (!userId) {
        throw new Error('Faltan datos del usuario')
    }

    const {
        tipoDocumento,
        numeroDocumento,
        parentesco
    } = request.body

    const familyRelationship = await createFamilyRelationship(userId, {tipoDocumento, numeroDocumento, parentesco});

    return response.status(201).json({
        success: true,
        message: 'Familiar registrado correctamente.',
        data: familyRelationship,
    });
}