import { familyRelationshipModel } from "../models/FamilyRelationship.js";
import { UserModel } from '../models/User.js';
import type{ TipoDocumento } from '../utils/enums_types_interfaces.js'

export async function getFamilyRelationships(userId: string) {
    return familyRelationshipModel.find({
        usuario: userId,
    }).populate(
        'familiar',
        'nombres apellidos tipoDocumento numeroDocumento telefono tipoVinculacion rolSistema cargo estado',
    ).lean()
}

export async function createFamilyRelationship(userId: string, data: {tipoDocumento: TipoDocumento; numeroDocumento: string; parentesco: string;}) {

    // 1. Buscar al familiar en los usuarios registrados
    const familiar = await UserModel.findOne({
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        estado: 'ACTIVO',
    });

    if(!familiar) {
        throw new Error(
            'La persona indicada no está registrada como usuario activo.',
        );
    }

    // 2. Evitar que el usuario se registre a sí mismo
    if (String(familiar._id) === userId) {
        throw new Error(
            'No puedes registrate a ti mismo como familiar.',
        );
    }

    // 3. Verificar si ya existe la relación
    const existingRelationship = await familyRelationshipModel.findOne({
        usuario: userId,
        familiar: familiar._id,
    });

    if (existingRelationship) {
        throw new Error(
            'Esta persona ya está registrada como familiar.',
        );
    }

    // 4. Crear la declaración
    return familyRelationshipModel.create({
        usuario: userId,
        familiar: familiar._id,
        parentesco: data.parentesco,
    });
}


