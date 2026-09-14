import { FamilyDeclarationModel } from "../models/FamilyDeclaration.js";
import { UserModel } from '../models/User.js'
import { ValidationError, ConflictError } from "../utils/errors.js";
import type { TipoVinculo, TipoDocumento} from "../utils/enums_types_interfaces.js";

export async function createFamilyDeclaration(
    declaranteId: string,
    tipoDocumento: TipoDocumento,
    numeroDocumento: string,
    tipoVinculo: TipoVinculo,
) {

    const numeroDocumentoNormalizado = String(numeroDocumento).trim();

    // 1. Buscar al familiar en los usuarios registrados
    const familiar = await UserModel.findOne({
        tipoDocumento,
        numeroDocumento: numeroDocumentoNormalizado,
        estado: 'ACTIVO',
    });

    if (!familiar) {
        throw new ValidationError(
            'El familiar debe estar registrado y tener su cuenta activa.',
            {
                numeroDocumento:
                    'No existe un usuario activo con este documento.',
            },
        );
    }

    // 2. Evitar que el usuario se registre a sí mismo
    if (familiar._id.toString() === declaranteId) {
        throw new ValidationError(
            'No puedes registrate a ti mismo como familiar.',
        );
    }

    // 3. Verificar si ya existe la relación
    const declaracionExiste = await FamilyDeclarationModel.findOne({
        declarante: declaranteId,
        familiar: familiar._id,
    });

    if (declaracionExiste) {
        throw new ConflictError(
            'Este usuario ya está registrado como familiar.',
            'FamilyDeclaration',
        );
    }

    // 4. Crear la declaración
    const declaracion = await FamilyDeclarationModel.create({
        declarante: declaranteId,
        familiar: familiar._id,
        tipoVinculo,
        fechaDeclaracion: new Date(),
        fechaConflicto: null,
    });

    return declaracion;
}