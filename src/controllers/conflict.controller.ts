import type { Request, Response } from 'express';
import { getConflicts, getConflictById, detectLevelOneConflicts, getDashboardStats, updateConflictStatus } from '../services/conflict.service.js'
import mongoose from 'mongoose';
import { generateConflictPdf } from '../services/conflict-report-PDF.service.js'; 
import { generateConflictExcel } from '../services/conflict-report-Excel.service.js'; 

// Obtener los conflictos
export async function getConflictsController(req: Request, res: Response) {
    const conflicts = await getConflicts();

    res.status(200).json({
        success: true,
        data: conflicts,
    });
}

// Obtener un conflicto en especifico por su id
export async function getConflictByIdController(req: Request, res: Response) {

    const { id } = req.params;

    // Validar que el id tenga un formato válido de MongoDB
    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID de conflicto inválido',
        });
    }
    
    const conflict = await getConflictById(id);

    return res.status(200).json({
        success: true,
        data: conflict,
    })

}

// Detectar conflictos
export async function detectConflictsController(req: Request, res: Response) {
    
    const conflicts = await detectLevelOneConflicts();

    return res.status(200).json({
        success: true,
        total: conflicts.length,
        data: conflicts,
    });
}

// Obtener estadísticas del dashboard
export async function getDashboardStatsController( req: Request, res: Response) {

    const stats = await getDashboardStats();

    return res.status(200).json({
        success: true,
        data: stats,
    });
}


// Actualizar estado del conflicto

export async function updateConflictStatusController(request: Request, response: Response) {

    const { id } = request.params;
    const { estado } = request.body;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({
            success: false,
            message: 'ID de conflicto inválido',
        });
    }

    const conflict = await updateConflictStatus(id, estado);

    response.status(200).json({
        success: true,
        message: 'Estado del conflicto actualizado correctamente.',
        data: conflict,
    });

}

export async function generateConflictReportController(
  request: Request,
  response: Response,
) {

  const { formato } = request.body;

  if (formato === 'pdf') {

    const pdf = await generateConflictPdf();

    response.setHeader(
      'Content-Type',
      'application/pdf',
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-conflictos.pdf"',
    );

    response.send(pdf);

    return;
  }

  if (formato === 'excel') {

    const excel = await generateConflictExcel();

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-conflictos.xlsx"',
    );

    response.send(excel);

    return;
  }

  response.status(400).json({
    success: false,
    message: 'Formato de reporte no válido.',
  });
}


