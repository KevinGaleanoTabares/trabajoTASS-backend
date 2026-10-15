/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 * 
 * Centraliza el procesamiento de todos los errores en la aplicación.
 * Transforma errores internos en respuestas HTTP consistentes.
 * 
 * Este middleware debe ser el ÚLTIMO en la cadena de middlewares de Express.
 */

import type { ErrorRequestHandler } from 'express';
import { AppError, isAppError } from '../utils/errors.js';
import mongoose from 'mongoose';
import { logError } from '../utils/logger.js';

/**
 * Middleware global de manejo de errores
 * 
 * Características:
 * - Captura todos los tipos de errores (AppError, Error, unknown)
 * - Envía respuestas HTTP con código de estado y formato consistente
 * - Registra metadatos estructurados sin mensajes o detalles de excepciones
 * - No expone detalles internos en respuestas de error del servidor
 */
export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  // Convertir el error a AppError si no lo es
  const appError = isAppError(error)
    ? error
    : handleUnknownError(error);

  logError('http.request.failed', error, {
    method: request.method,
    route: `${request.baseUrl}${request.route?.path ?? ''}` || 'unmatched',
    statusCode: appError.statusCode,
    code: appError.code,
  });

  const isInternalError = appError.statusCode >= 500;
  response.status(appError.statusCode).json({
    success: false,
    message: isInternalError
      ? 'Ocurrió un error inesperado en el servidor.'
      : appError.message,
    code: appError.code,
    ...(!isInternalError && appError.details
      ? { details: appError.details }
      : {}),
  });
};

/**
 * Maneja errores desconocidos convirtiéndolos a AppError
 */
function handleUnknownError(error: unknown): AppError {

  // Error duplicado de MongoDB

  if (error instanceof Error && 'code' in error && error.code === 11000) {

    return new AppError(
      'Ya existe un registro con los datos proporcionados.',
      409,
      'DUPLICATE_KEY'
    );
  }

  //Error de ObjectId inválido

  if (error instanceof mongoose.Error.CastError) {

    return new AppError(
      'El identificador proporcionado no es válido.',
      400,
      'INVALID_ID'
    );
  }

  // Error de validación de Mongoose

  if (error instanceof mongoose.Error.ValidationError) {

    return new AppError(
      'Los datos proporcionados no son válidos.',
      400,
      'DATABASE_VALIDATION_ERROR'
    );
  }

  return new AppError(
    'Ocurrió un error inesperado en el servidor.',
    500,
    'INTERNAL_SERVER_ERROR',
  );
}

// Error de llave duplicada

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    error.code === 11000
  );
}
