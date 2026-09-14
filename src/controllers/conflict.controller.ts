import type { Request, Response } from 'express';
import { getConflicts, getConflictById, detectLevelOneConflicts, getDashboardStats } from '../services/conflict.service.js'
import mongoose from 'mongoose';

export async function getConflictsController(req: Request, res: Response) {
    const conflicts = await getConflicts();

    res.status(200).json({
        success: true,
        data: conflicts,
    });
}

export async function getConflictByIdController(req: Request, res: Response) {

    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID de conflicto inválido',
        });
    }
    
    const conflict = await getConflictById(id);

    if (!conflict) {
        return res.status(404).json({
            success: false,
            message: 'Conflicto no encontrado',
        });
    }

    return res.status(200).json({
        success: true,
        data: conflict,
    })

}

export async function detectConflictsController(req: Request, res: Response) {
    const conflicts = await detectLevelOneConflicts();

    return res.status(200).json({
        success: true,
        total: conflicts.length,
        data: conflicts,
    });
}

export async function getDashboardStatsController( req: Request, res: Response) {

    const stats = await getDashboardStats();

    return res.status(200).json({
        success: true,
        data: stats,
    });
}