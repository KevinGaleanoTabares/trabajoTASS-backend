import ExcelJS from 'exceljs';
import { ConflictModel } from '../models/Conflict.js';

function formatDate(date?: Date | null): string {
  if (!date) {
    return 'No registrada';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
}

function formatInvolucrados(involucrados: any[]): string {

  if (!involucrados?.length) {
    return 'No registrados';
  }

  return involucrados
    .map((persona, index) => {

      const datos = [
        `${index + 1}. ${persona.nombre}`,
        `Documento: ${persona.documento}`,
        `Tipo de vinculación: ${persona.tipoVinculacion}`,
        `Correo: ${persona.correo}`,
        `Teléfono: ${persona.telefono}`,
      ];

      if (persona.area) {
        datos.push(`Área: ${persona.area}`);
      }

      if (persona.empresa) {
        datos.push(`Empresa: ${persona.empresa}`);
      }

      if (persona.nit) {
        datos.push(`NIT: ${persona.nit}`);
      }

      return datos.join('\n');
    })
    .join('\n\n');
}

function formatCoincidencias(
  coincidencias: string[]
): string {

  if (!coincidencias?.length) {
    return 'No registradas';
  }

  return coincidencias
    .map(item => `• ${item}`)
    .join('\n');
}

export async function generateConflictExcel(): Promise<Buffer> {

  const conflicts = await ConflictModel.find()
    .sort({ fechaDeteccion: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();

  /*
   * ==========================================
   * HOJA 1 — DATOS PRINCIPALES
   * ==========================================
   */

  const worksheet = workbook.addWorksheet(
    'Datos principales'
  );

  worksheet.mergeCells('A1:J1');

  worksheet.getCell('A1').value =
    'TASS — REPORTE DE CONFLICTOS';

  worksheet.getCell('A1').font = {
    bold: true,
    size: 18,
  };

  worksheet.getCell('A1').alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };

  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:J2');

  worksheet.getCell('A2').value =
    `Generado el ${formatDate(new Date())}`;

  worksheet.getCell('A2').alignment = {
    horizontal: 'center',
  };

  worksheet.getRow(2).height = 20;

  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    'Código',
    'Nivel de riesgo',
    'Estado',
    'Categoría',
    'Fecha detección',
    'Fecha resolución',
    'Descripción',
    'Coincidencias detectadas',
    'Personas involucradas',
    'Investigador asignado',
  ]);

  /*
   * Estilo encabezados
   */

  headerRow.eachCell(cell => {

    cell.font = {
      bold: true,
      color: {
        argb: 'FFFFFFFF',
      },
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FF0456F4',
      },
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    cell.border = {
      top: {
        style: 'thin',
      },
      left: {
        style: 'thin',
      },
      bottom: {
        style: 'thin',
      },
      right: {
        style: 'thin',
      },
    };
  });

  /*
   * Datos
   */

  for (const conflict of conflicts) {

    worksheet.addRow([
      conflict.codigo,

      conflict.nivel,

      conflict.estado,

      conflict.categoria,

      formatDate(conflict.fechaDeteccion),

      formatDate(conflict.fechaResolucion),

      conflict.descripcion || 'No registrada',

      formatCoincidencias(
        conflict.coincidencias
      ),

      formatInvolucrados(
        conflict.involucrados
      ),

      'Administrador',

    ]);
  }

  /*
   * Ancho de columnas
   */

  worksheet.columns = [
    { width: 20 },
    { width: 18 },
    { width: 24 },
    { width: 18 },
    { width: 25 },
    { width: 25 },
    { width: 55 },
    { width: 40 },
    { width: 60 },
    { width: 25 },
  ];

  /*
   * Ajustes de las filas
   */

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber >= 5) {

      row.height = 80;

      row.eachCell(cell => {

        cell.alignment = {
          vertical: 'top',
          wrapText: true,
        };

        cell.border = {
          top: {
            style: 'thin',
            color: {
              argb: 'FFE5E7EB',
            },
          },
          left: {
            style: 'thin',
            color: {
              argb: 'FFE5E7EB',
            },
          },
          bottom: {
            style: 'thin',
            color: {
              argb: 'FFE5E7EB',
            },
          },
          right: {
            style: 'thin',
            color: {
              argb: 'FFE5E7EB',
            },
          },
        };
      });
    }
  });

  /*
   * Filtro
   */

  worksheet.autoFilter = {
    from: 'A4',
    to: 'J4',
  };

  /*
   * Congelar encabezado
   */

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 4,
    },
  ];

  /*
   * ==========================================
   * HOJA 2 — RESUMEN
   * ==========================================
   */

  const summary = workbook.addWorksheet(
    'Resumen'
  );

  summary.mergeCells('A1:B1');

  summary.getCell('A1').value =
    'TASS — RESUMEN DE CONFLICTOS';

  summary.getCell('A1').font = {
    bold: true,
    size: 18,
  };

  summary.getCell('A1').alignment = {
    horizontal: 'center',
  };

  summary.addRow([]);

  const total = conflicts.length;

  const pendientes = conflicts.filter(
    conflict => conflict.estado === 'PENDIENTE'
  ).length;


  const resueltos = conflicts.filter(
    conflict => conflict.estado === 'RESUELTO'
  ).length;


  const bajo = conflicts.filter(
    conflict => conflict.nivel === 'BAJO'
  ).length;

  const medio = conflicts.filter(
    conflict => conflict.nivel === 'MEDIO'
  ).length;

  const alto = conflicts.filter(
    conflict => conflict.nivel === 'ALTO'
  ).length;

  const tasaResolucion =
    total > 0
      ? (resueltos / total) * 100
      : 0;

  const summaryData = [
    ['Indicador', 'Valor'],

    ['Total de conflictos', total],

    ['Conflictos pendientes', pendientes],

    ['Conflictos resueltos', resueltos],

    ['Riesgo bajo', bajo],

    ['Riesgo medio', medio],

    ['Riesgo alto', alto],

    [
      'Tasa de resolución',
      `${tasaResolucion.toFixed(2)}%`,
    ],
  ];

  summaryData.forEach((row, index) => {

    const excelRow = summary.addRow(row);

    if (index === 0) {

      excelRow.eachCell(cell => {

        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFFFF',
          },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0456F4',
          },
        };

        cell.alignment = {
          horizontal: 'center',
        };
      });
    }
  });

  summary.getColumn('A').width = 30;
  summary.getColumn('B').width = 25;

  summary.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  /*
   * ==========================================
   * HOJA 3 — METADATOS
   * ==========================================
   */

  const metadata = workbook.addWorksheet(
    'Metadatos'
  );

  metadata.mergeCells('A1:B1');

  metadata.getCell('A1').value =
    'TASS — METADATOS DEL REPORTE';

  metadata.getCell('A1').font = {
    bold: true,
    size: 18,
  };

  metadata.getCell('A1').alignment = {
    horizontal: 'center',
  };

  metadata.addRow([]);

  const metadataRows = [
    ['Campo', 'Información'],

    ['Sistema', 'TASS'],

    ['Tipo de reporte', 'Reporte de conflictos'],

    ['Fecha de generación', formatDate(new Date())],

    ['Filtros aplicados', 'Todos los conflictos registrados'],

    ['Total de registros', conflicts.length],

    ['Formato', 'Excel (.xlsx)'],
  ];

  metadataRows.forEach((row, index) => {

    const excelRow = metadata.addRow(row);

    if (index === 0) {

      excelRow.eachCell(cell => {

        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFFFF',
          },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0456F4',
          },
        };
      });
    }
  });

  metadata.getColumn('A').width = 25;
  metadata.getColumn('B').width = 55;

  /*
   * ==========================================
   * GENERACIÓN EN MEMORIA
   * ==========================================
   */

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}