import PDFDocument from 'pdfkit';
import { ConflictModel } from '../models/Conflict.js';

export async function generateConflictPdf(): Promise<Buffer> {

    const conflicts = await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean();

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument();

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        doc.fontSize(20).text('Reporte de conflictos', {
            align: 'center'
        });

        doc.moveDown();

        for (const conflict of conflicts) {
            doc.fontSize(12)
                .text(`Código: ${conflict.codigo}`)
                .text(`Nivel: ${conflict.nivel}`)
                .text(`Estado: ${conflict.estado}`)
                .text(`Fecha detección: ${conflict.fechaDeteccion}`)
                .text(`Descripción: ${conflict.descripcion}`)
                .moveDown();
        }

        doc.end();
    });
}