# Catálogo de errores TASS

Este catálogo centraliza el código interno, el estado HTTP asociado, la descripción y el módulo. Se replica la tabla aprobada sin normalizar sus códigos ni descripciones.

| Código | HTTP | Descripción | Módulo |
|---|---:|---|---|
| T400 | 400 | Solicitud inválida - Datos mal formados | General |
| T401 | 401 | No autorizado - Token inválido o expirado | Auth |
| T402 | 402 | Cuenta no activada - Debe verificar correo | Auth |
| T403 | 403 | Acceso denegado - Rol sin permisos | Auth |
| T404 | 404 | Recurso no encontrado | General |
| T405 | 405 | Método HTTP no permitido | General |
| T409 | 409 | Conflicto - Documento/correo ya registrado | Registro |
| T410 | 410 | Token de activación expirado | Auth |
| T422 | 422 | Contraseña no cumple requisitos de seguridad | Auth |
| T429 | 429 | Demasiadas solicitudes - Rate limit | General |
| T500 | 500 | Error interno del servidor | General |
| T501 | 501 | Error al consultar MongoDB por desconexión | BD |
| T502 | 502 | Error en Redis - Caché no disponible | Redis |
| T503 | 503 | Servicio RabbitMQ no disponible | RabbitMQ |
| T504 | 504 | Timeout en detección de conflictos | Conflictos |
| T505 | 505 | Error al generar PDF/Excel | Exportación |
| T506 | 506 | Error al enviar correo electrónico | Notificaciones |
| T507 | 507 | Documento no válido en BD de TASS | Validación |
| T508 | 508 | NIT no corresponde a proveedor de TASS | Validación |

## Ejemplo de uso con Winston

```ts
import { ErrorCatalog } from '../utils/errorCatalog.js';
import { logger } from '../utils/logger.js';

const errorDefinition = ErrorCatalog.T404;

logger.error({
  codigo: errorDefinition.codigo,
  httpStatus: errorDefinition.httpStatus,
  mensaje: errorDefinition.descripcion,
  modulo: errorDefinition.modulo,
});
```

El catálogo define datos reutilizables, pero no integra automáticamente esos códigos en el middleware ni en los controladores. Las llamadas deben incorporarlos explícitamente cuando se autorice esa integración.

## Nota sobre el significado HTTP estándar

Se conserva literalmente el mapeo aprobado. Algunos estados HTTP suelen tener un significado estándar distinto a la descripción interna TASS: 402 (Payment Required), 501 (Not Implemented), 505 (HTTP Version Not Supported), 506 (Variant Also Negotiates), 507 (Insufficient Storage) y 508 (Loop Detected). Los clientes y herramientas HTTP pueden interpretar esos estados según el estándar además de mostrar el código interno TASS.
