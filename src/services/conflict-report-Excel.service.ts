import ExcelJS from 'exceljs';
import { ConflictModel } from '../models/Conflict.js';

export async function generateConflictExcel() {

    const conflicts = await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean();

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Conflictos');

    worksheet.columns = [

        {
            header: 'Código',
            key: 'codigo',
            width: 15
        },
        {
            header: 'Nivel',
            key: 'nivel',
            width: 15  
        },
        {
            header: 'Estado',
            key: 'estado',
            width: 20
        },
        {
            header: 'Fecha detección',
            key: 'fechaDeteccion',
            width: 20
        },
        {
            header: 'Fecha resolución',
            key: 'fechaResolucion',
            width: 20
        },
        {
            header: 'Descripción',
            key: 'descripcion',
            width: 50
        }
    ];

    for (const conflict of conflicts) {

        worksheet.addRow({
            codigo: conflict.codigo,
            nivel: conflict.nivel,
            estado: conflict.estado,
            fechaDeteccion: conflict.fechaDeteccion,
            fechaResolucion: conflict.fechaResolucion,
            descripcion: conflict.descripcion
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
}