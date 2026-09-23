import { ConflictModel } from '../models/Conflict.js';
import { UserModel } from '../models/User.js';
import { familyRelationshipModel } from '../models/FamilyRelationship.js';
import type { ActiveUser, ConflictLevel } from '../utils/enums_types_interfaces.js';
import mongoose from 'mongoose';


export async function getConflicts() {

console.log('FAMILY CONFLICTS GOTTEN', (await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean()));
return  await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean();
}


export async function getConflictById(id: string) {
  return await ConflictModel.findById(id).lean();
}


async function generateConflictCode(number: number): Promise<string> {

  const year = new Date().getFullYear();
  const formattedNumber = String(number).padStart(6, '0');

  return `CON-${year}-${formattedNumber}`;
}


function determineConflictLevel( tipoVinculacionA: string, tipoVinculacionB: string ): ConflictLevel {

  const vinculations = new Set([
    tipoVinculacionA,
    tipoVinculacionB,
  ]);

  const hasDirector = vinculations.has('directivo');
  const hasProvider = vinculations.has('proveedor');

  if (hasDirector && hasProvider) {
    return 'MEDIO';
  }

  return 'BAJO';
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
}


// Detecta conflictos relacionados con relaciones familiares
export async function detectLevelOneConflicts() {

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
  const totalConflicts = await ConflictModel.countDocuments();

  let nextConflictNumber = totalConflicts + 1;


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
    const codigo = await generateConflictCode(
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
        `Se detectó una relación familiar entre ` +
        `${usuario.nombres} ${usuario.apellidos} y ` +
        `${familiar.nombres} ${familiar.apellidos}. ` +
        `Parentesco registrado: ${relationship.parentesco}. ` +
        `Se requiere revisión administrativa.`,

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

}


export async function getDashboardStats() {

  const [
    totalUsuarios,
    totalConflictos,
    conflictosAltoRiesgo,
    conflictosPendientes,
    conflictosResueltos,
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

  ]);


  const tasaResolucion = totalConflictos > 0 ? (conflictosResueltos / totalConflictos) * 100 : 0;


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

    tasaResolucion: Number(
      tasaResolucion.toFixed(2),
    ),

    tiempoPromedioResolucion: Number(
      tiempoPromedioResolucion.toFixed(2),
    ),

  };

}