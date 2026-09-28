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

/**
 * Middleware global de manejo de errores
 * 
 * Características:
 * - Captura todos los tipos de errores (AppError, Error, unknown)
 * - Envía respuestas HTTP con código de estado y formato consistente
 * - Registra errores detallados en consola para debugging
 * - No expone detalles internos en respuestas de producción
 * - Soporta entorno de desarrollo vs producción
 */
export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  // Convertir el error a AppError si no lo es
  const appError = isAppError(error)
    ? error
    : handleUnknownError(error);

  // Logging detallado del error (útil para debugging)
  logError(appError, request);

  // Enviar respuesta HTTP
  response.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    code: appError.code,
    // En producción, no incluir detalles internos
    // ...(process.env.NODE_ENV !== 'production' && {
    details: appError.details,
    // }),
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

  // Error nativo

  if (error instanceof Error) {
    console.error(
      'Error nativo capturado: ',
      error.message,
    );

    // Error nativo de JavaScript

    console.error('Error nativo capturado:', error.message);

    return new AppError(
      process.env.NODE_ENV === 'production'
        ? 'Ocurrió un error inesperado en el servidor'
        : error.message,
      500,
      'INTERNAL_SERVER_ERROR',
      {
        originalError: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      }
    );

  }

  // Error desconocido
  console.error('Error desconocido capturado:', error);

  return new AppError(
    'Ocurrió un error inesperado en el servidor',
    500,
    'INTERNAL_SERVER_ERROR',
    {
      originalError: String(error),
    }
  );
}

/**
 * Registra detalles del error para debugging y auditoría
 */
function logError(error: AppError, request: any): void {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = request.originalUrl;

  console.error(
    `[${timestamp}] ERROR ${method} ${url}`,
    {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    }
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

