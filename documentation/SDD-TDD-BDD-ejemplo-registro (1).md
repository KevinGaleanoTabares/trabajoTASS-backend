# Ejemplo SDD + TDD + BDD — Registro de usuario TASS

> Ejemplo inicial para validar contra la implementación actual. No afirma que todos estos casos ya estén cubiertos por pruebas existentes.

## 1. SDD — Especificación primero

### Objetivo
Permitir que una persona envíe el formulario de registro y recibir una respuesta clara si la cuenta se crea o si la solicitud no cumple las reglas.

### Reglas conocidas del contexto TASS
- El registro solicita datos de identificación, correo, teléfono, vinculación/cargo y contraseña.
- La cuenta recién creada puede quedar pendiente de activación por correo.
- El backend debe validar los datos aunque Angular también los valide.
- No deben registrarse contraseñas ni tokens en logs.

### Criterios de aceptación propuestos
- CA-01: Si los datos requeridos son válidos, el frontend envía una solicitud al endpoint de registro real configurado en el proyecto.
- CA-02: Si el backend confirma el registro, se muestra una confirmación entendible y no se afirma que la cuenta está activa si requiere activación.
- CA-03: Si el correo ya está registrado, se muestra un mensaje claro y el formulario deja de estar en estado de envío.
- CA-04: Si las contraseñas no coinciden, el formulario no envía la solicitud.
- CA-05: Si el servidor no está disponible, el usuario recibe un mensaje general y el error técnico queda registrado sin secretos.
- CA-06: Los datos sensibles no aparecen en logs.

## 2. TDD — Pruebas antes de implementar

Crear pruebas usando el framework que ya esté instalado. No agregar Jest, Vitest u otra herramienta hasta comprobar la configuración existente.

### Casos unitarios sugeridos para el formulario
1. Formulario vacío: inválido.
2. Correo con formato incorrecto: inválido.
3. Contraseñas diferentes: error de coincidencia y envío bloqueado.
4. Formulario válido: permite iniciar el envío.
5. Respuesta de conflicto del backend: mensaje de correo duplicado y `isSubmitting` vuelve a `false`.
6. Error de red: mensaje general y `isSubmitting` vuelve a `false`.

### Ejemplo conceptual (pseudocódigo)
```ts
it('no debe enviar el formulario si las contraseñas no coinciden', () => {
  // Arrange: completar los demás campos válidamente.
  // Act: establecer password y confirmPassword diferentes.
  // Assert: el formulario es inválido y no se llama al servicio.
});
```

Este fragmento es pseudocódigo: debe adaptarse a los nombres y framework de pruebas del repositorio.

## 3. BDD — Comportamiento en lenguaje de negocio

### Escenario: registro correcto pendiente de activación
```gherkin
Feature: Registro de usuario TASS

  Scenario: Registrar una cuenta válida
    Given que la persona completa todos los campos requeridos con datos válidos
    And las contraseñas coinciden
    When envía el formulario de registro
    And el backend confirma que la cuenta fue creada
    Then el sistema muestra una confirmación de registro
    And informa que la cuenta está pendiente de activación si aplica
```

### Escenario: correo duplicado
```gherkin
  Scenario: Intentar registrar un correo ya existente
    Given que ya existe una cuenta con ese correo
    When la persona envía el formulario de registro
    And el backend responde con un conflicto
    Then el sistema muestra un mensaje de correo ya registrado
    And finaliza el estado de carga del formulario
    And permite corregir los datos sin recargar la página
```

### Escenario: contraseñas diferentes
```gherkin
  Scenario: Evitar el envío cuando las contraseñas no coinciden
    Given que la persona completa el formulario
    And la contraseña y su confirmación son diferentes
    When intenta enviar el formulario
    Then se muestra el error de coincidencia
    And no se envía una petición al backend
```

## 4. Cómo demostrar el flujo
1. Revisar la especificación con el responsable de negocio.
2. Escribir las pruebas y comprobar que fallan por la razón esperada.
3. Implementar el cambio mínimo.
4. Ejecutar las pruebas y la compilación.
5. Ejecutar una prueba manual o E2E de registro si el entorno lo permite.
6. Adjuntar evidencia real de resultados y registrar limitaciones.
