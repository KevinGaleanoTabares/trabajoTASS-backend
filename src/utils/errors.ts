export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
    code = 'VALIDATION_ERROR',
  ) {
    super(message, 400, code, { fieldErrors });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, public readonly resource?: string) {
    super(message, 409, 'CONFLICT', { resource });
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super(message, 401, 'AUTHENTICATION_FAILED');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = 'No tienes permisos para acceder a este recurso',
    public readonly requiredRole?: string,
  ) {
    super(message, 403, 'AUTHORIZATION_FAILED', { requiredRole });
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resourceType = 'Recurso') {
    super(`${resourceType} no encontrado.`, 404, 'NOT_FOUND', { resourceType });
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    public readonly serviceName: string,
    message = `Error al conectar con ${serviceName}`,
    statusCode = 502,
  ) {
    super(message, statusCode, 'EXTERNAL_SERVICE_ERROR', { serviceName });
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = 'Error al acceder a la base de datos',
    public readonly originalError?: unknown,
  ) {
    super(message, 500, 'DATABASE_ERROR');
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = 'Ocurrió un error inesperado en el servidor',
    public readonly originalError?: unknown,
  ) {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, error);
  }

  return new InternalServerError('Error desconocido', error);
}
