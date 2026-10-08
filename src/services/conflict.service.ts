import { ConflictModel } from '../models/Conflict.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { UserModel } from '../models/User.js';
import { familyRelationshipModel } from '../models/FamilyRelationship.js';
import type { ActiveUser, ConflictLevel, ConflictStatus } from '../utils/enums_types_interfaces.js';
import mongoose from 'mongoose';
import { isDuplicateKeyError } from '../middlewares/error.middleware.ts.js'


export async function getConflicts() {

  try {

    const conflicts = await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean();

    console.log('FAMILY CONFLICTS GOTTEN', conflicts);

    return conflicts;

  } catch (error: unknown) {

    console.error('Error obteniendo conflictos:', error);

    throw error;
  }
}

export async function getConflictById(id: string) {

  try {

    const conflict = await ConflictModel.findById(id).lean();

    if (!conflict) {
      throw new NotFoundError('Conflicto');
    }

    return conflict;

  } catch (error: unknown) {

    console.error('Error obteniendo conflicto: ', error);

    throw error;
  }

}

async function getLastConflictCode(): Promise<string | null>  {

  const year = new Date().getFullYear();
  
  const lastConflict = await ConflictModel.findOne({codigo: new RegExp(`^CON-${year}-`)}).sort({ codigo: -1 }).select('codigo').lean();

  return lastConflict?.codigo ?? null;

}

function getNextConflictNumber(lastCode: string | null): number {

  if (!lastCode) {
    return 1;
  }

  const numberPart = lastCode.split('-').pop();
  const lastNumber = Number(numberPart);

  if (Number.isNaN(lastNumber)) {

    throw new Error(

      `El código de conflicto "${lastCode}" tiene un formato inválido.`

    );

  }

  return lastNumber + 1;

}

function generateConflictCode(number: number): string {

  const year = new Date().getFullYear();
  const formattedNumber = String(number).padStart(6, '0');

  return `CON-${year}-${formattedNumber}`;
}


function determineConflictLevel(tipoVinculacionA: string, tipoVinculacionB: string): ConflictLevel {

  const vinculaciones = new Set([
    tipoVinculacionA,
    tipoVinculacionB,
  ]);

  // BAJO: empleado ↔ empleado

  if (tipoVinculacionA === 'empleado' && tipoVinculacionB === 'empleado') {

    return 'BAJO';

  }

  // MEDIO: empleado ↔ proveedor

  if (vinculaciones.has('empleado') && vinculaciones.has('proveedor')) {

    return 'MEDIO';

  }

  // MEDIO: empleado ↔ administrativo

  if (vinculaciones.has('empleado') && vinculaciones.has('proveedor')) {

    return 'MEDIO';

  }

  // MEDIO: empleado ↔ directivo

  if (vinculaciones.has('empleado') && vinculaciones.has('directivo')) {

    return 'MEDIO';

  }

  return 'ALTO';

}

function determineConflictCategory(tipoVinculacion: string): 'EMPLEADO' | 'ADMINISTRATIVO' | 'DIRECTIVO' | 'PROVEEDOR' {
  switch (tipoVinculacion) {
    case 'empleado':
      return 'EMPLEADO';

    case 'administrativo':
      return 'ADMINISTRATIVO';

    case 'directivo':
      return 'DIRECTIVO';

    case 'proveedor':
      return 'PROVEEDOR';

    default:
      throw new Error(
        `Tipo de vinculación no válido: ${tipoVinculacion}`,
      );
  }
}


async function conflictAlreadyExists(usuarioDeclaranteId: string, FamiliarId: string): Promise<boolean> {

  try {
    const usuarioObjectId = new mongoose.Types.ObjectId(usuarioDeclaranteId);
    const familiarObjectId = new mongoose.Types.ObjectId(FamiliarId);
    const existingConflict = await ConflictModel.findOne({

      usuarioDeclarante: usuarioObjectId,

      involucrados: {
        $elemMatch: {
          userId: familiarObjectId,
        },
      },

    }).lean();

    return Boolean(existingConflict);

  } catch (error: unknown) {

    console.error('Error verificando si el conflicto ya existe: ', error);

    throw error;
  }

}


// Detecta conflictos relacionados con relaciones familiares
export async function detectLevelOneConflicts() {
  try {
    // 1. Obtener únicamente usuarios activos
    const activeUsers = await UserModel.find({
      estado: 'ACTIVO',
    }).populate(
      'empresaProveedora',
      'nit',
    ).lean();


    // 2. Crear un mapa para buscar usuarios rápidamente por su ID            ///////////////////////////////////////
    const usersMap = new Map<string, ActiveUser>();

    for (const user of activeUsers) {

      usersMap.set(
        String(user._id),
        user as ActiveUser,
      );

    }

    // 3. Obtener las relaciones familiares

    const familyRelationships = await familyRelationshipModel.find().lean();

    // 4. Guardar los conflictos detectados
    const detectedConflicts = [];

    // 5. Evitar comparar dos veces la misma pareja

    const processedPairs = new Set<string>();

    // 6. Obtener el número inicial para generar códigos
    const lastConflictCode = await getLastConflictCode();

    let nextConflictNumber = getNextConflictNumber(lastConflictCode);


    // 7. Recorrer todas las relaciones familiares
    for (const relationship of familyRelationships) {

      const usuarioId = String(relationship.usuario);
      const familiarId = String(relationship.familiar);


      // 8. Evitar que un usuario sea relacionado consigo mismo
      if (usuarioId === familiarId) {
        continue;
      }


      // 9. Ordenar los IDs para crear una pareja única

      const pairKey = `${usuarioId}:${familiarId}`;

      if (processedPairs.has(pairKey)) {
        continue;
      }

      processedPairs.add(pairKey);

      // 10. Evitar relaciones duplicadas


      // 11. Buscar ambos usuarios en el mapa
      const usuario = usersMap.get(usuarioId);
      const familiar = usersMap.get(familiarId);


      // 12. Si alguno no existe o no está activo, ignorar la relación
      if (!usuario || !familiar) {
        continue;
      }


      // 13. Determinar el nivel del posible conflicto
      const nivel = determineConflictLevel(
        usuario.tipoVinculacion,
        familiar.tipoVinculacion,
      );


      // 14. Verificar si ya existe un conflicto para esa pareja
      const alreadyExists = await conflictAlreadyExists(
        usuarioId,
        familiarId,
      );


      if (alreadyExists) {
        continue;
      }


      // 15. Generar un código único dentro de esta ejecución
      const codigo = generateConflictCode(
        nextConflictNumber,
      );

      nextConflictNumber++;

      const categoria = determineConflictCategory(
        usuario.tipoVinculacion,
      );

      const nitUsuario = usuario.tipoVinculacion === 'proveedor' ? usuario.empresaProveedora?.nit ?? null : null;

      const nitFamiliar = familiar.tipoVinculacion === 'proveedor' ? familiar.empresaProveedora?.nit ?? null : null;

      // 16. Construir el conflicto
      const conflict = {

        codigo,

        usuarioDeclarante: usuario._id,

        categoria,

        parentesco: relationship.parentesco,

        nivel,

        estado: 'PENDIENTE',

        fechaDeteccion: new Date(),

        involucrados: [

          {
            userId: usuario._id,
            nombre: `${usuario.nombres} ${usuario.apellidos}`,
            tipo: usuario.tipoDocumento,
            documento: usuario.numeroDocumento,
            rol: usuario.rolSistema,
            tipoVinculacion: usuario.tipoVinculacion,
            correo: usuario.correo,
            telefono: usuario.telefono,
            area: null,
            empresa: null,
            nit: nitUsuario,
          },

          {
            userId: familiar._id,
            nombre: `${familiar.nombres} ${familiar.apellidos}`,
            tipo: familiar.tipoDocumento,
            documento: familiar.numeroDocumento,
            rol: familiar.rolSistema,
            tipoVinculacion: familiar.tipoVinculacion,
            correo: familiar.correo,
            telefono: familiar.telefono,
            area: null,
            empresa: null,
            nit: nitFamiliar,
          },

        ],

        coincidencias: [
          'RELACION FAMILIAR',
        ],

        descripcion:
          'Se detectó un posible conflicto de interés por relación familiar. ' +
          'Se requiere revisión administrativa.',

        evidencias: [],

        notas: [],

        auditLog: [],

      };
      console.log('RESULTADO', conflict)


      // 17. Agregar el conflicto al arreglo
      detectedConflicts.push(conflict);

    }


    // 18. Si no se detectaron conflictos, retornar arreglo vacío
    if (detectedConflicts.length === 0) {
      return [];
    }


    // 19. Guardar todos los conflictos en MongoDB
    const savedConflicts = await ConflictModel.insertMany(
      detectedConflicts,
    );


    // 20. Retornar los conflictos guardados
    return savedConflicts;

  } catch (error: unknown) {
    console.error('Error detectando conflictos:', error);

    if (isDuplicateKeyError(error)) {
      throw new ConflictError(
        'Uno de los conflictos detectados ya existe.',
        'Conflict'
      );
    }

    throw error;
  }

}


export async function getDashboardStats() {

  try {

    const [
      totalUsuarios,
      totalConflictos,
      conflictosAltoRiesgo,
      conflictosPendientes,
      conflictosResueltos,
      pendingConflicts
    ] = await Promise.all([

      UserModel.countDocuments({
        estado: 'ACTIVO',
      }),

      ConflictModel.countDocuments(),

      ConflictModel.countDocuments({
        nivel: 'ALTO',
      }),

      ConflictModel.countDocuments({
        estado: 'PENDIENTE',
      }),

      ConflictModel.countDocuments({
        estado: 'RESUELTO',
      }),

      ConflictModel.find({
        estado: 'PENDIENTE'
      }).select('fechaDeteccion').lean(),

    ]);

    const tasaBase = totalConflictos > 0 ? (conflictosResueltos / totalConflictos) * 100 : 0;

    const penalizacion = calculatePendingPenalty(pendingConflicts);

    const tasaResolucion = Math.max(0, tasaBase - penalizacion)

    const estadoResolucion = tasaResolucion >= 85 ? 'EXCELENTE' : 'DEBES MEJORAR, estás debajo del 85%';

    const conflictosConResolucion = await ConflictModel
      .find({
        estado: 'RESUELTO',
        fechaResolucion: {
          $ne: null,
        },
      })
      .select('fechaDeteccion fechaResolucion')
      .lean();


    let tiempoPromedioResolucion = 0;


    if (conflictosConResolucion.length > 0) {

      const tiempos = conflictosConResolucion.map(
        conflicto => {

          const diferencia =
            new Date(conflicto.fechaResolucion!).getTime() -
            new Date(conflicto.fechaDeteccion).getTime();


          return diferencia / (1000 * 60 * 60 * 24);

        },
      );


      tiempoPromedioResolucion =
        tiempos.reduce(
          (total, tiempo) => total + tiempo, 0) / tiempos.length;

    }


    return {

      totalUsuarios,
      totalConflictos,
      conflictosAltoRiesgo,
      conflictosPendientes,
      conflictosResueltos,
      tasaResolucion: Number(tasaResolucion.toFixed(2)),
      estadoResolucion,
      penalizacion: Number(penalizacion.toFixed(2)),
      tiempoPromedioResolucion: Number(tiempoPromedioResolucion.toFixed(2)),

    };

  } catch (error: unknown) {

    console.error('Error obteniendo estadísticas del dashboard: ', error);
    
    throw error;

  }

}

function calculatePendingPenalty(pendingConflicts: Array<{ fechaDeteccion: Date}>): number {

  const now = new Date();

  let penalty = 0;

  for (const conflict of pendingConflicts) {

    const differenceMs = now.getTime() - new Date(conflict.fechaDeteccion).getTime();

    const daysPending = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    if (daysPending > 2) {

      const extraDays = daysPending - 2;

      penalty += extraDays * 3;
    }

  }

  return penalty;

}

export async function updateConflictStatus(id: string, estado: ConflictStatus) {

  const conflict = await ConflictModel.findById(id);

  if (!conflict) {

    throw new ValidationError('El conflicto no existe.');

  }

  if (estado === 'RESUELTO' && conflict.estado === 'RESUELTO') {

    throw new ConflictError('El conflicto ya está resuelto')

  }

  if (estado === 'PENDIENTE' && conflict.estado !== 'RESUELTO') {
    throw new ValidationError('Solo se puede devolver a pendiente un conflicto resuelto.');
  }

  if (estado !== 'PENDIENTE' && estado !== 'RESUELTO') {
    throw new ValidationError('El estado solicitado no está permitido para esta acción.');
  }

  conflict.estado = estado;
  conflict.fechaResolucion = estado === 'RESUELTO' ? new Date() : null;

  await conflict.save();

  return conflict;
}
