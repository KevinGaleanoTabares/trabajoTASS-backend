# Tres prompts efectivos para tareas comunes de TASS

## Prompt 1 — Analizar antes de cambiar un endpoint
Actúa como desarrollador senior del backend TASS. Inspecciona primero la ruta, controlador, servicio, modelo y middleware relacionados con **[funcionalidad]**. No inventes nombres ni endpoints. Explica el flujo actual, identifica riesgos y propone un plan mínimo. No modifiques archivos todavía. Señala qué información falta y qué pruebas serían necesarias.

## Prompt 2 — Aplicar TDD a una regla de negocio
Sobre la regla **[describir regla]** del módulo **[módulo real de TASS]**, inspecciona el framework y las pruebas existentes. Propón casos positivos, negativos y límites. Escribe primero las pruebas usando las convenciones existentes y explica qué comportamiento espera cada una. No instales dependencias. No afirmes que una prueba pasa hasta ejecutarla.

## Prompt 3 — Revisar un cambio antes de integrarlo
Revisa el diff de **[archivos]** como si fueras un revisor senior. Busca regresiones, validaciones ausentes, manejo incompleto de errores, problemas de tipos, riesgos de seguridad, logs con datos sensibles y falta de pruebas. Prioriza los hallazgos por severidad y cita el archivo/línea cuando sea posible. No reescribas el código de inmediato; primero presenta los hallazgos y las pruebas recomendadas.

## Reglas de uso
- Adjuntar solo fragmentos necesarios, nunca `.env`, contraseñas, tokens o datos reales de usuarios.
- Proporcionar objetivo, contexto, restricciones y resultado esperado.
- Pedir que la IA declare supuestos e incertidumbres.
- Verificar el resultado mediante revisión humana, pruebas y compilación.
