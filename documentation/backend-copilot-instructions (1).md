# Instrucciones generales para GitHub Copilot — TASS Backend

## Contexto
- Backend TASS con Node.js, Express, TypeScript y Mongoose/MongoDB. Verifica versiones reales en `package.json`.
- Las rutas actuales, modelos, middleware y contratos son la fuente de verdad. Inspecciónalos antes de crear algo nuevo.

## Reglas obligatorias
1. No inventes rutas, esquemas, variables de entorno ni funciones. Busca las existentes primero.
2. Trabaja solo en la fase autorizada y no continúes a otra HU sin confirmación.
3. Respeta la arquitectura real (rutas, controladores, servicios, acceso a datos/modelos y middleware) sin crear capas innecesarias.
4. Valida entradas en el servidor; no confíes solo en validaciones del frontend.
5. Usa errores tipados/estandarizados según el catálogo existente. No filtres stack traces, credenciales ni detalles internos al cliente.
6. Los logs deben ser estructurados y útiles, sin contraseñas, tokens, datos personales innecesarios ni cadenas de conexión.
7. MongoDB sigue siendo la fuente de verdad para datos persistentes. Redis, si se incorpora, es solo para los casos aprobados de caché temporal; no dupliques la persistencia sin diseño aprobado.
8. Para tareas asíncronas con RabbitMQ, define comportamiento ante reintentos, mensajes duplicados, errores y persistencia; no introduzcas colas sin caso de uso aprobado.
9. No imprimas valores de `.env` ni copies secretos. Documenta variables en `.env.example` con valores ficticios.
10. No añadas dependencias ni cambies autenticación, autorización, contratos o datos sin explicar el impacto.
11. Nunca afirmes que las pruebas pasan si no las ejecutaste.

## Al terminar
- Lista archivos modificados y decisiones.
- Indica pruebas/comandos realmente ejecutados y sus resultados.
- Explica migraciones/configuración manual pendiente y riesgos.
- Detente y espera confirmación antes de la siguiente fase.
