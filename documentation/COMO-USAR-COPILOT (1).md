# Cómo pedirle trabajo a Copilot en TASS

## Prompt inicial recomendado

> Antes de modificar código, lee las instrucciones del repositorio en `.github/copilot-instructions.md` y las instrucciones específicas aplicables. Inspecciona la implementación actual y las pruebas; no supongas rutas, versiones ni contratos. En esta respuesta solo quiero diagnóstico, archivos implicados, plan breve y criterios de aceptación. No edites nada hasta que te lo autorice. Trabaja únicamente la fase indicada; no avances a otra HU. No muestres secretos ni valores de `.env`.

## Después de aprobar el plan

> Implementa únicamente el plan aprobado. Haz cambios pequeños y consistentes con el repositorio. Ejecuta las pruebas o build pertinentes y reporta exactamente qué comandos ejecutaste y sus resultados. Si una prueba falla, explica el fallo; no lo ocultes ni lo declares resuelto sin evidencia. Resume archivos modificados, riesgos y pendientes, y detente para que yo valide la fase.

## Para diagnosticar Docker

> No cambies todavía la configuración. Revisa `compose.yml`, `Dockerfile`, entrypoint, variables de entorno requeridas (sin imprimir sus valores), conexión de MongoDB, rutas HTTP registradas y logs. Identifica la primera causa demostrable del fallo. Devuélveme comandos concretos de verificación y una propuesta mínima. No asumas que `/api/health` existe: confirma si está registrada. No imprimas el contenido de `.env`.

## Para SDD/TDD/BDD
- SDD: documentar el comportamiento esperado y criterios de aceptación antes del cambio.
- TDD: escribir/ajustar una prueba automatizada que falle, implementar lo mínimo y volver a ejecutar.
- BDD: expresar escenarios de negocio en Given/When/Then y relacionarlos con pruebas verificables.
- No inventar que se aplicó TDD/BDD si no hay evidencia en pruebas/commits.
