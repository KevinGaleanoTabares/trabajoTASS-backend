# Kit HU-INFRA-03 adaptado a GitHub Copilot para TASS

Este kit reemplaza las instrucciones específicas de Claude por archivos orientados a GitHub Copilot en VS Code. **No copies todo el kit a ambos repositorios sin revisar**: usa las rutas indicadas abajo.

## 1. Qué copiar y dónde

### En `trabajoTASSfrontend`
Copia estos archivos conservando sus rutas relativas:
- `.github/copilot-instructions.md`
- `.github/instructions/angular.instructions.md`
- `.github/prompts/implementar-funcionalidad-tass.prompt.md`
- `.github/skills/angular-feature/SKILL.md` (si tu versión de Copilot admite Agent Skills)
- `docs/SDD-TDD-BDD-ejemplo-registro.md`
- `docs/prompts-efectivos.md`
- `docs/adr/ADR-001-flujo-de-desarrollo-asistido-por-IA.md`

### En `trabajoTASS-backend`
Copia estos archivos conservando sus rutas relativas:
- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/prompts/implementar-funcionalidad-tass.prompt.md`
- `.github/skills/backend-endpoint/SKILL.md` (si tu versión de Copilot admite Agent Skills)
- `docs/SDD-TDD-BDD-ejemplo-registro.md`
- `docs/prompts-efectivos.md`
- `docs/adr/ADR-001-flujo-de-desarrollo-asistido-por-IA.md`

Los archivos `.github/copilot-instructions.md` de frontend y backend tienen contenido diferente. Copia el correcto a cada repositorio, no los mezcles.

## 2. Cómo usarlos en VS Code
1. Abre la carpeta raíz del repositorio correcto en VS Code.
2. Crea las carpetas `.github`, `.github/instructions`, `.github/prompts` y, opcionalmente, `.github/skills` si no existen.
3. Copia los archivos del kit con las rutas anteriores.
4. Abre GitHub Copilot Chat y verifica que esté habilitado el uso de instrucciones del repositorio.
5. Para una tarea, pega un prompt de `docs/prompts-efectivos.md` o abre el prompt de `.github/prompts/implementar-funcionalidad-tass.prompt.md` si tu versión lo admite.
6. Pide primero análisis y plan; revisa el plan antes de autorizar cambios. Después solicita cambios pequeños y pruebas.

Copilot puede no cargar Skills automáticamente en todas las versiones/entornos. Si no las reconoce, abre el `SKILL.md` pertinente y pídele explícitamente que siga ese procedimiento. El archivo principal de instrucciones es `.github/copilot-instructions.md`.

## 3. Reglas de trabajo por fases
- No ejecutar todas las HUs de una vez.
- Trabajar únicamente la fase que el usuario autorice.
- No avanzar a otra fase hasta que la actual esté probada.
- Al terminar, informar archivos modificados, decisiones, comandos ejecutados, resultados y pendientes.
- Nunca inventar rutas, scripts, endpoints, pruebas o resultados: inspeccionar el repositorio real.
- No mostrar ni copiar secretos de `.env`; usar `.env.example` con nombres de variables y valores ficticios.

## 4. Nota de validación
El ejemplo de Registro y el ADR son propuestas iniciales. Antes de usarlos como especificación definitiva, Copilot debe contrastarlos con los modelos, rutas, validadores y pruebas reales del proyecto.

## Documentación técnica del backend
- [Infraestructura Docker de TASS](./infraestructura-docker.md): configuración requerida, comandos Compose, servicios, persistencia y verificaciones.
- [Catálogo de errores TASS](../docs/error-catalog.md): códigos internos, estados HTTP y ejemplo de logging.
