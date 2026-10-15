---
name: backend-endpoint
description: Planificar, implementar y revisar un endpoint REST en el backend TypeScript/Express de TASS siguiendo los patrones existentes.
---

# Skill: endpoint de backend TASS

## Cuándo usar
Cuando se solicite crear, modificar o revisar una ruta REST del backend.

## Procedimiento
1. Localiza la ruta, controlador, servicio, modelo Mongoose, tipos y middleware existentes relacionados.
2. Describe el recorrido de la petición actual y los patrones que deben conservarse.
3. Define contrato: método, ruta real, autenticación/autorización, cuerpo, respuesta y errores. No inventes rutas; propone una solo si se pide diseñarla.
4. Define validaciones de entrada en el servidor y autorización por rol cuando aplique.
5. Considera errores de duplicidad, recurso inexistente, datos inválidos y fallo de base de datos según los códigos ya definidos en TASS.
6. Diseña pruebas para éxito, validación, falta de autenticación/autorización y errores esperados.
7. Implementa el cambio mínimo usando los tipos y convenciones del repositorio.
8. Ejecuta las pruebas pertinentes y la compilación disponibles.
9. Resume archivos cambiados, comandos ejecutados, resultados y pendientes.

## Restricciones
- No exponer contraseñas, JWT ni tokens en logs o respuestas.
- No devolver documentos completos de Mongoose si contienen campos sensibles.
- No agregar dependencias ni cambiar configuración global sin justificarlo.
- No afirmar que las pruebas pasaron si no se ejecutaron.
- Si falta una regla de negocio, pregunta antes de inventarla.

## Formato de salida
1. Hallazgos.
2. Contrato del endpoint.
3. Plan y archivos afectados.
4. Implementación propuesta.
5. Pruebas y resultados.
6. Riesgos/puntos por confirmar.
