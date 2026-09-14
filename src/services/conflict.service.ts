import { ConflictModel } from '../models/Conflict.js';
import { UserModel } from '../models/User.js'

export async function getConflicts() {
    return ConflictModel.find()
    .sort({ fechaDeteccion: -1})
    .lean();
}

export async function getConflictById(id: string) {
    return ConflictModel.findById(id).lean();
}


//consular los empleas que ya tengan un registro "empleado" y esten activos "empleado" todos sus datos y familiare,
export async function detectLevelOneConflicts() {
    const users = await UserModel.find({
        estado: 'ACTIVO',
    }).lean();

    const employees = users.filter(
        user => user.tipoVinculacion === 'empleado'
    );

    const providers = users.filter(
        user => user.tipoVinculacion === 'proveedor'
    );

    const detectedConflicts = [];

    for (const employee of employees) {
        for (const provider of providers) {

            const sameDocument =
                employee.numeroDocumento === provider.numeroDocumento;

            const sameEmail =
                employee.correo.toLowerCase() === provider.correo.toLowerCase();

            const samePhone =
                employee.telefono === provider.telefono;

            const employeeLastName =
                employee.apellidos.trim().toLocaleLowerCase();

            const providerLastName =
                provider.apellidos.trim().toLocaleLowerCase();

            const sameLastName =
                employeeLastName === providerLastName;


            // Para guardar cuáles reglas coincidieron
            const coincidencias: string[] = [];

            if (sameDocument) {
                coincidencias.push('DOCUMENTO');
            }

            if (sameEmail) {
                coincidencias.push('CORREO');
            }

            if (samePhone) {
                coincidencias.push('TELEFONO');
            }

            if (sameLastName) {
                coincidencias.push('APELLIDO');
            }


            // Si no hubo ninguna coincidencia, no hay conflicto
            if (coincidencias.length === 0) {
                continue;
            }


            detectedConflicts.push({
                nivel: 'BAJO',
                estado: 'PENDIENTE',

                fechaDeteccion: new Date(),

                involucrados: [
                    {
                        userId: employee._id,
                        nombre: `${employee.nombres} ${employee.apellidos}`,
                        documento: employee.numeroDocumento,
                        tipo: employee.tipoDocumento,
                        rol: employee.rolSistema,
                        tipoVinculacion: employee.tipoVinculacion,
                        correo: employee.correo,
                        telefono: employee.telefono,
                        empresa: null
                    },
                    {
                        userId: provider._id,
                        nombre: `${provider.nombres} ${provider.apellidos}`,
                        documento: provider.numeroDocumento,
                        tipo: provider.tipoDocumento,
                        rol: provider.rolSistema,
                        tipoVinculacion: provider.tipoVinculacion,
                        correo: provider.correo,
                        telefono: provider.telefono,
                        empresa: null
                    },
                ],

                // Ahora sabemos qué produjo el conflicto
                coincidencias,

                descripcion:
                    `Se detectó una coincidencia por: ${coincidencias.join(', ')}.`,

                evidencias: [],

                notas: [],

                auditLog: [],
            });
        }
    }

    return detectedConflicts;
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
            estado: 'ACTIVO'
        }),

        ConflictModel.countDocuments(),

        ConflictModel.countDocuments({
            nivel: 'ALTO'
        }),

        ConflictModel.countDocuments({
            estado: 'PENDIENTE'
        }),

        ConflictModel.countDocuments({
            estado: 'RESUELTO'
        }),

    ]);

    const tasaResolucion = totalConflictos > 0 ? (conflictosResueltos / totalConflictos) * 100 : 0;
    
    const conflictosConResolucion = await ConflictModel.find({
        estado: 'RESUELTO',
        fechaResolucion: { $ne: null},
    }).select('fechaDeteccion fechaResolucion').lean();

    let tiempoPromedioResolucion = 0;

    if (conflictosConResolucion.length > 0) {
        
        const tiempos = conflictosConResolucion.map(conflicto => {

            const diferencia = new Date(conflicto.fechaResolucion!).getTime() - new Date(conflicto.fechaDeteccion).getTime();

            return diferencia / (1000 * 60 * 60 * 24);
        });

        tiempoPromedioResolucion = tiempos.reduce((total, tiempo) => total + tiempo, 0) / tiempos.length;

    }

    return {
        totalUsuarios,
        totalConflictos,
        conflictosAltoRiesgo,
        conflictosPendientes,
        tasaResolucion: Number(tasaResolucion.toFixed(2)),
        tiempoPromedioResolucion: Number(tiempoPromedioResolucion.toFixed(2)),
    };
}