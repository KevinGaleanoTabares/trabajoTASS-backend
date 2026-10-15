export type ErrorCatalogModule =
  | 'General'
  | 'Auth'
  | 'Registro'
  | 'BD'
  | 'Redis'
  | 'RabbitMQ'
  | 'Conflictos'
  | 'Exportación'
  | 'Notificaciones'
  | 'Validación';

export type ErrorCatalogEntry = {
  readonly codigo: string;
  readonly httpStatus: number;
  readonly descripcion: string;
  readonly modulo: ErrorCatalogModule;
};

export const ErrorCatalog = {
  T400: {
    codigo: 'T400',
    httpStatus: 400,
    descripcion: 'Solicitud inválida - Datos mal formados',
    modulo: 'General',
  },
  T401: {
    codigo: 'T401',
    httpStatus: 401,
    descripcion: 'No autorizado - Token inválido o expirado',
    modulo: 'Auth',
  },
  T402: {
    codigo: 'T402',
    httpStatus: 402,
    descripcion: 'Cuenta no activada - Debe verificar correo',
    modulo: 'Auth',
  },
  T403: {
    codigo: 'T403',
    httpStatus: 403,
    descripcion: 'Acceso denegado - Rol sin permisos',
    modulo: 'Auth',
  },
  T404: {
    codigo: 'T404',
    httpStatus: 404,
    descripcion: 'Recurso no encontrado',
    modulo: 'General',
  },
  T405: {
    codigo: 'T405',
    httpStatus: 405,
    descripcion: 'Método HTTP no permitido',
    modulo: 'General',
  },
  T409: {
    codigo: 'T409',
    httpStatus: 409,
    descripcion: 'Conflicto - Documento/correo ya registrado',
    modulo: 'Registro',
  },
  T410: {
    codigo: 'T410',
    httpStatus: 410,
    descripcion: 'Token de activación expirado',
    modulo: 'Auth',
  },
  T422: {
    codigo: 'T422',
    httpStatus: 422,
    descripcion: 'Contraseña no cumple requisitos de seguridad',
    modulo: 'Auth',
  },
  T429: {
    codigo: 'T429',
    httpStatus: 429,
    descripcion: 'Demasiadas solicitudes - Rate limit',
    modulo: 'General',
  },
  T500: {
    codigo: 'T500',
    httpStatus: 500,
    descripcion: 'Error interno del servidor',
    modulo: 'General',
  },
  T501: {
    codigo: 'T501',
    httpStatus: 501,
    descripcion: 'Error al consultar MongoDB por desconexión',
    modulo: 'BD',
  },
  T502: {
    codigo: 'T502',
    httpStatus: 502,
    descripcion: 'Error en Redis - Caché no disponible',
    modulo: 'Redis',
  },
  T503: {
    codigo: 'T503',
    httpStatus: 503,
    descripcion: 'Servicio RabbitMQ no disponible',
    modulo: 'RabbitMQ',
  },
  T504: {
    codigo: 'T504',
    httpStatus: 504,
    descripcion: 'Timeout en detección de conflictos',
    modulo: 'Conflictos',
  },
  T505: {
    codigo: 'T505',
    httpStatus: 505,
    descripcion: 'Error al generar PDF/Excel',
    modulo: 'Exportación',
  },
  T506: {
    codigo: 'T506',
    httpStatus: 506,
    descripcion: 'Error al enviar correo electrónico',
    modulo: 'Notificaciones',
  },
  T507: {
    codigo: 'T507',
    httpStatus: 507,
    descripcion: 'Documento no válido en BD de TASS',
    modulo: 'Validación',
  },
  T508: {
    codigo: 'T508',
    httpStatus: 508,
    descripcion: 'NIT no corresponde a proveedor de TASS',
    modulo: 'Validación',
  },
} as const satisfies Record<string, ErrorCatalogEntry>;

export type ErrorCode = keyof typeof ErrorCatalog;
