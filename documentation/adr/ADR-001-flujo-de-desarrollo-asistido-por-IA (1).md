# ADR-001: Flujo de desarrollo asistido por IA para TASS

- Estado: Propuesto
- Fecha: 2026-10-12
- Responsables: Equipo de desarrollo TASS

## Contexto
TASS tiene frontend Angular y backend Node.js/Express con TypeScript y MongoDB. Las nuevas HUs piden documentar buenas prácticas de IA y aplicar SDD, TDD y BDD a módulos reales. Los cambios generados por IA pueden asumir rutas, modelos o reglas que no existan y pueden introducir regresiones si no se verifican.

## Decisión propuesta
Usar un flujo incremental:
1. SDD: describir requisito, reglas, límites y criterios de aceptación.
2. TDD: crear pruebas automatizadas antes de la implementación cuando el entorno de pruebas existente lo permita.
3. Implementar el cambio mínimo.
4. BDD: describir y verificar los comportamientos principales en escenarios Given/When/Then.
5. Revisar el diff, ejecutar pruebas/build y documentar resultados.
6. Usar un archivo de instrucciones del proyecto y Skills para repetir convenciones.

## Alternativas consideradas
- **Pegar prompts sin contexto:** rápido, pero aumenta el riesgo de respuestas genéricas o incompatibles con TASS.
- **Aceptar código generado sin pruebas:** reduce el tiempo inicial, pero dificulta detectar regresiones.
- **Flujo SDD + TDD + BDD con revisión humana:** requiere más disciplina al inicio, pero permite rastrear requisitos, pruebas y cambios.

## Consecuencias
### Positivas
- Mejor trazabilidad entre requisito, implementación y pruebas.
- Menor probabilidad de inventar contratos de API o alterar reglas de negocio.
- Respuestas de IA más consistentes entre integrantes del equipo.

### Costes y riesgos
- Las pruebas iniciales pueden requerir ajustar el entorno actual.
- Los archivos de instrucciones y Skills pueden quedar desactualizados.
- La IA puede equivocarse; la revisión humana y las pruebas siguen siendo obligatorias.

## Validación pendiente
- Revisar la propuesta con el líder técnico.
- Confirmar el framework de pruebas instalado en frontend y backend.
- Ejecutar el flujo completo en un módulo real y registrar resultados.
