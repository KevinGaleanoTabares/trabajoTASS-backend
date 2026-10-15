---
name: Angular TASS
description: Reglas para componentes, rutas, formularios, servicios y plantillas Angular.
applyTo: "**/*.ts, **/*.html, **/*.css, **/*.scss"
---

- Confirma el patrón existente del módulo antes de decidir entre standalone y NgModule.
- Usa `@if`, `@for` y `@switch` cuando sea coherente con la versión y el estilo ya usado.
- En formularios reactivos, centraliza reglas de validación y muestra mensajes claros asociados al campo.
- Representa explícitamente estados de carga, éxito y error; libera siempre el estado de carga tanto en éxito como en error (por ejemplo, con `finalize` cuando corresponda).
- Mantén HTTP y transformación de datos en servicios si esa es la convención del proyecto.
- Evita `any` salvo justificación; no dupliques interfaces ni validadores existentes.
- No cambies CSS global ni presupuesto de build para ocultar advertencias sin explicar el impacto.
- Para cada cambio, indica cómo probarlo manualmente y qué pruebas automatizadas aplican.
