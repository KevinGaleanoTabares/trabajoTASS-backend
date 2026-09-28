import { familyRelationshipModel } from "../models/FamilyRelationship.js";
import { UserModel } from '../models/User.js';
import { ValidationError, ConflictError } from "../utils/errors.js";
import type{ TipoDocumento } from '../utils/enums_types_interfaces.js'

export async function getFamilyRelationships(userId: string) {

    try {

        return await familyRelationshipModel.find({
            usuario: userId,

        }).populate(
            'familiar',
            'nombres apellidos tipoDocumento numeroDocumento telefono tipoVinculacion rolSistema cargo estado',
        ).lean()
    } catch (error: unknown) {
        console.error('Error obteniendo relaciones familiares: ', error);
        throw error;
    }

}

export async function createFamilyRelationship(userId: string, data: { tipoDocumento: TipoDocumento; numeroDocumento: string; parentesco: string; }) {

    try {

        const numeroDocumentoNormalizado = String(data.numeroDocumento).trim();

        // 1. Buscar al familiar en los usuarios registrados
        const familiar = await UserModel.findOne({
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: numeroDocumentoNormalizado,
            estado: 'ACTIVO',
        });

        if (!familiar) {
            throw new ValidationError(
                'La persona indicada no está registrada como usuario activo.',
                {
                    numeroDocumento:
                    'No existe un usuario activo con este documento.'
                },
            );
        }

        // 2. Evitar que el usuario se registre a sí mismo
        if (String(familiar._id) === userId) {
            throw new ValidationError(
                'No puedes registrate a ti mismo como familiar.',
            );
        }

        // 3. Verificar si ya existe la relación
        const existingRelationship = await familyRelationshipModel.findOne({
            usuario: userId,
            familiar: familiar._id,
        });

        if (existingRelationship) {
            throw new ConflictError(
                'Esta persona ya está registrada como familiar.',
                'FamilyRelationship'
            );
        }

        // 4. Crear la declaración
        return familyRelationshipModel.create({
            usuario: userId,
            familiar: familiar._id,
            parentesco: data.parentesco,
        });

    } catch (error: unknown) {
        console.error('Error creando realción familiar', error);
        throw error;
    }

}


