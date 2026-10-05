import PDFDocument from 'pdfkit';
import { ConflictModel } from '../models/Conflict.js';
import { fileURLToPath } from 'node:url';

function formatDate(date?: Date | null): string {

    if (!date) {
        return 'No registrada';
    }

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(date));
}

function formatInvolucrados(involucrados: typeof ConflictModel extends never ? never : any[]): string {

    if (!involucrados?.length) {
        return 'No registrados';
    }

    return involucrados.map((persona, index) => {
        return [
            `${index + 1}. ${persona.nombre}`,
            `Documento: ${persona.documento}`,
            `Tipo de vinculación: ${persona.tipoVinculacion}`,
            `Correo: ${persona.correo}`,
            `Teléfono: ${persona.telefono}`,
            persona.area ? `Área: ${persona.area}` : null,
            persona.empresa ? `Empresa: ${persona.empresa}` : null,
            persona.nit ? `NIT: ${persona.nit}` : null,
        ].filter(Boolean).join('\n');
    }).join('\n\n');

}

function formatoCoincidencias(coincidencias: string[]): string {

    if (!coincidencias?.length) {
        return 'No registradas';
    }

    return coincidencias.map(item => `• ${item}`).join('\n');
}

function getLevelLabel(nivel: string): string {

    switch (nivel) {
        case 'BAJO':
            return 'Riesgo bajo';
        case 'MEDIO':
            return 'Riesgo medio';
        case 'ALTO':
            return 'Riesgo alto';
        default:
            return nivel;
    }

}

function getStatusLabel(estado: string): string {

    switch (estado) {
        case 'PENDIENTE':
            return 'Pendiente de revisión';
        case 'EN_INVESTIGACION':
            return 'En investigación';
        case 'RESUELTO':
            return 'Resuelto';
        case 'DESCARTADO':
            return 'Descartado';
        case 'ESCALADO':
            return 'Escalado';

        default: return estado;
    }
}

export async function generateConflictPdf(): Promise<Buffer> {

    const conflicts = await ConflictModel.find().sort({ fechaDeteccion: -1 }).lean();

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 45,
                bottom: 80,
                left: 45,
                right: 45,
            },
            bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        const logoPath = fileURLToPath(new URL('../assets/images/logo-tass.png', import.meta.url));

        const generatedAt = new Date();

        /*
        * ==========================================
        * ENCABEZADO
        * ==========================================
        */

        doc.image(logoPath, 45, 40, { width: 70 });

        doc.fontSize(20).font('Helvetica-Bold').text('TASS', 125, 45);

        doc.fontSize(15).font('Helvetica-Bold').text('Reporte de conflictos', 125, 70);

        doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`Generado el ${formatDate(generatedAt)}`, 125, 92);

        doc.strokeColor('#0456f4').lineWidth(2).moveTo(42, 140).lineTo(550, 140).stroke();

        doc.fillColor('#000000');

        doc.moveDown(5);

        /*
        * ==========================================
        * RESUMEN EJECUTIVO
        * ==========================================
        */

        const total = conflicts.length;

        const pendientes = conflicts.filter(
            conflict => conflict.estado === 'PENDIENTE'
        ).length;

        const investigacion = conflicts.filter(
            conflict => conflict.estado === 'EN_INVESTIGACION'
        ).length;

        const resueltos = conflicts.filter(
            conflict => conflict.estado === 'RESUELTO'
        ).length;

        const altoRiesgo = conflicts.filter(
            conflict => conflict.nivel === 'ALTO'
        ).length;

        doc.fontSize(14).font('Helvetica-Bold').text('Resumen ejecutivo');

        doc.moveDown(0.5);

        const summaryY = doc.y;

        const cards = [
            {
                title: 'Total',
                value: total,
            },
            {
                title: 'Pendientes',
                value: pendientes,
            },
            {
                title: 'En investigación',
                value: investigacion,
            },
            {
                title: 'Resueltos',
                value: resueltos,
            },
            {
                title: 'Riesgo alto',
                value: altoRiesgo,
            },
        ];

        const cardWidth = 94;
        const cardHeight = 55;
        const gap = 7;

        cards.forEach((card, index) => {

            const x = 45 + index * (cardWidth + gap);

            doc.roundedRect(x, summaryY, cardWidth, cardHeight, 6).fillAndStroke('#F5F8FF', '#D9E4FF');

            doc.fontSize(18).font('Helvetica-Bold').fillColor('#0456F4').text(String(card.value), x, summaryY + 8,
                {
                    width: cardWidth,
                    align: 'center'
                });

            doc.fontSize(7).font('Helvetica').fillColor('#444444').text(card.title, x + 4, summaryY + 34,
                {
                    width: cardWidth - 8,
                    align: 'center'
                }
            );
        });

        doc.y = summaryY + cardHeight + 30;
        doc.x = 45;

        /*
        * ==========================================
        * INFORMACIÓN DEL REPORTE
        * ==========================================
        */

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Información del reporte');

        doc.moveDown(0.4);

        doc.fontSize(9).font('Helvetica').text(`Registros incluidos: ${total}`).text('Filtros aplicados: Todos los conflictos registrados').text(`Fecha de generación: ${formatDate(generatedAt)}`);

        doc.moveDown(1);

        /*
        * ==========================================
        * DETALLE DE CADA CONFLICTO
        * ==========================================
        */

        conflicts.forEach((conflict, index) => {

            if (doc.y > 680) {
                doc.addPage();
            }

            /*
            * Cabecera del conflicto
            */

            doc.roundedRect(45, doc.y, 505, 35, 5).fill('#0456F4');

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text(`Conflicto ${index + 1} - ${conflict.codigo}`, 52, doc.y + 10);

            doc.y += 48;

            /*
            * Datos principales
            */

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Información general');

            doc.moveDown(0.3);

            doc.fontSize(9).font('Helvetica')
                .text(`Nivel de riesgo: ${getLevelLabel(conflict.nivel)}`)
                .text(`Estado: ${getStatusLabel(conflict.estado)}`)
                .text(`Categoría: ${conflict.categoria}`)
                .text(`Fecha de detección: ${formatDate(conflict.fechaDeteccion)}`)
                .text(`Fecha de resolución: ${formatDate(conflict.fechaResolucion)}`);

            doc.moveDown(0.8);

            /*
            * Descripción
            */

            doc.fontSize(10).font('Helvetica-Bold').text('Descripción del conflicto');

            doc.moveDown(0.3);

            doc.fontSize(9).font('Helvetica').text(conflict.descripcion || 'No registrada',
                {
                    width: 500,
                    lineGap: 3,
                }
            );

            doc.moveDown(0.8);

            /*
            * Coincidencias
            */

            doc.fontSize(10).font('Helvetica-Bold').text('Coincidencias detectadas');

            doc.moveDown(0.3);

            doc.fontSize(9).font('Helvetica').text(formatoCoincidencias(conflict.coincidencias),
                {
                    width: 500,
                    lineGap: 3
                }
            );

            doc.moveDown(0.8);

            /*
            * Involucrados
            */

            doc.fontSize(10).font('Helvetica-Bold').text('Personas involucradas');

            doc.moveDown(0.3);

            doc.fontSize(8.5).font('Helvetica').text(formatInvolucrados(conflict.involucrados),
                {
                    width: 500,
                    lineGap: 3
                }
            );

            /*
            * Investigador
            */

            if (conflict.investigadorAsignado?.nombre) {

                doc.moveDown(0.8);

                doc.fontSize(10).font('Helvetica-Bold').text('Investigador asignado');

                doc.fontSize(9).font('Helvetica').text(

                    conflict.investigadorAsignado.nombre

                );

            }

            /*
            * Resolución
            */

            if (conflict.resolucion?.descripcion) {

                doc.moveDown(0.8);

                doc.fontSize(10).font('Helvetica-Bold').text('Resolución');

                doc.fontSize(9).font('Helvetica').text(
                        conflict.resolucion.descripcion,
                        {
                            width: 500,
                            lineGap: 3,
                        }
                    );

                if (conflict.resolucion.accionTomada) {
                    doc
                        .moveDown(0.3)
                        .text(
                            `Acción tomada: ${conflict.resolucion.accionTomada}`
                        );
                }
            }

            /*
             * Separador
             */

            if (index < conflicts.length - 1) {

                doc.moveDown(1);

                doc.strokeColor('#DDDDDD').lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();

                doc.moveDown(1);
            }
        });

        /*
         * ==========================================
         * PIE DE PÁGINA
         * ==========================================
         */

        const range = doc.bufferedPageRange();

        for (
            let page = range.start;
            page < range.start + range.count;
            page++
        ) {

            doc.switchToPage(page);
            doc.page.margins.bottom = 45;

            doc.fontSize(8).font('Helvetica').fillColor('#777777').text(
                    `TASS — Reporte de conflictos | Página ${page + 1} de ${range.count}`,
                    45,
                doc.page.height - doc.page.margins.bottom - 15,
                    {
                        width: 505,
                        align: 'center',
                        lineBreak: false,
                    }
                );
        }

        doc.end();
    });
}