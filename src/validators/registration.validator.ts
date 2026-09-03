import { CARGOS_VALIDOS } from "../constants/cargos.js";

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!@#$%^&*()]).{9,}$/,
  NUMBERS_ONLY: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  PHONE: /^\d{10,}$/,
  NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,
};

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) return { valid: false, error: 'El email es requerido.' };
  if (trimmed.length > 254) return { valid: false, error: 'El email no puede exceder 254 caracteres.' };
  if (!REGEX.EMAIL.test(trimmed)) return { valid: false, error: 'El formato del email no es válido.' };

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'La contraseña es requerida.' };
  if (password.length < 9) return { valid: false, error: 'La contraseña debe tener mínimo 9 caracteres.' };
  if (password.length > 128) return { valid: false, error: 'La contraseña no puede exceder 128 caracteres.' };
  if (!REGEX.PASSWORD.test(password)) {
    return {
      valid: false,
      error: 'La contraseña debe contener mayúscula, minúscula, número y carácter especial.',
    };
  }

  return { valid: true };
}

export function validateName(name: string, fieldName = 'nombre'): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (!trimmed) return { valid: false, error: `${fieldName} es requerido.` };
  if (trimmed.length < 2) return { valid: false, error: `${fieldName} debe tener mínimo 2 caracteres.` };
  if (trimmed.length > 80) return { valid: false, error: `${fieldName} no puede exceder 80 caracteres.` };
  if (!REGEX.NAME.test(trimmed)) return { valid: false, error: `${fieldName} contiene caracteres no válidos.` };

  return { valid: true };
}

export function validateDocumentNumber(docNumber: string, docType: string): { valid: boolean; error?: string } {
  const trimmed = docNumber.trim();

  if (!trimmed) return { valid: false, error: 'El número de documento es requerido.' };
  if (!REGEX.ALPHANUMERIC.test(trimmed)) return { valid: false, error: 'El número de documento solo debe contener letras y números.' };
  if (trimmed.length < 3 || trimmed.length > 20) return { valid: false, error: 'El número de documento debe tener entre 3 y 20 caracteres.' };
  if (docType === 'CC' && !REGEX.NUMBERS_ONLY.test(trimmed)) {
    return { valid: false, error: 'La Cédula de Ciudadanía debe ser solo números.' };
  }

  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const trimmed = phone.trim();

  if (!trimmed) return { valid: false, error: 'El teléfono es requerido.' };
  if (!REGEX.PHONE.test(trimmed)) return { valid: false, error: 'El teléfono debe tener mínimo 10 dígitos.' };
  if (trimmed.length > 20) return { valid: false, error: 'El teléfono no puede exceder 20 dígitos.' };

  return { valid: true };
}

export function validateEnum(
  value: string,
  allowedValues: string[],
  fieldName: string,
): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: `${fieldName} es requerido.` };
  if (!allowedValues.includes(value)) {
    return { valid: false, error: `${fieldName} debe ser uno de: ${allowedValues.join(', ')}.` };
  }

  return { valid: true };
}

export function validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { valid: false, error: 'La confirmación de la contraseña es requerida.' };
  }
 
  console.log("confirmar contraseña", confirmPassword)
  console.log("confirmar contraseña", password)

  if (password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden.' };
  }

  return { valid: true };
}

export function validateCargo(cargo: string): string | null {
  if (!cargo) {
    return 'El cargo es obligatorio.';
  }

  if (!CARGOS_VALIDOS.includes(cargo as typeof CARGOS_VALIDOS[number])) {
    return 'Debes seleccionar un cargo válido.';
  }

  return null;
}

export function validateNumeroDocumento(
  numeroDocumento: string,
  tipoDocumento: string,
): string | null {

  if (!numeroDocumento) {
    return 'El número de documento es obligatorio.';
  }

  if (tipoDocumento === 'PASAPORTE') {
    if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/.test(numeroDocumento)) {
      return 'El pasaporte es inválido.';
    }

    return null;
  }

  if (!/^\d+$/.test(numeroDocumento)) {
    return 'El número de documento solo puede contener números.';
  }

  return null;
}

export function validateRegistration(data: {
  nombres: unknown;
  apellidos: unknown;
  tipoDocumento: unknown;
  numeroDocumento: unknown;
  correo: unknown;
  telefono: unknown;
  tipoVinculacion: unknown;
  empresaProveedora: unknown;
  cargo: string;
  password: unknown;
  confirmPassword: unknown;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const nombresValidation = validateName(String(data.nombres ?? ''), 'Nombres');
  if (!nombresValidation.valid) errors.nombres = nombresValidation.error || '';

  const apellidosValidation = validateName(String(data.apellidos ?? ''), 'Apellidos');
  if (!apellidosValidation.valid) errors.apellidos = apellidosValidation.error || '';

  const docTypeValidation = validateEnum(String(data.tipoDocumento ?? ''), ['CC', 'CE', 'NIT', 'PASAPORTE'], 'Tipo de documento');
  if (!docTypeValidation.valid) errors.tipoDocumento = docTypeValidation.error || '';

  const docNumberValidation = validateDocumentNumber(String(data.numeroDocumento ?? ''), String(data.tipoDocumento ?? ''));
  if (!docNumberValidation.valid) errors.numeroDocumento = docNumberValidation.error || '';

  const emailValidation = validateEmail(String(data.correo ?? ''));
  if (!emailValidation.valid) errors.correo = emailValidation.error || '';

  const phoneValidation = validatePhone(String(data.telefono ?? ''));
  if (!phoneValidation.valid) errors.telefono = phoneValidation.error || '';

  const vinculationValidation = validateEnum(String(data.tipoVinculacion ?? ''), ['empleado', 'administrativo', 'directivo', 'proveedor'], 'Tipo de vinculación');
  if (!vinculationValidation.valid) errors.tipoVinculacion = vinculationValidation.error || '';

  const cargoValidation = validateName(String(data.cargo ?? ''), 'Cargo');
  if (!cargoValidation.valid) errors.cargo = cargoValidation.error || '';

  const cargoError = validateCargo(data.cargo);
  if (cargoError) {
    errors.cargo = cargoError;
  }

  const validarTipoDoc = validateNumeroDocumento(String(data.numeroDocumento ?? ''), String(data.tipoDocumento ?? ''));
  if (validarTipoDoc) {
    errors.numeroDocumento = validarTipoDoc;
  }

  const passwordValidation = validatePassword(String(data.password ?? ''));
  if (!passwordValidation.valid) errors.password = passwordValidation.error || '';

  const confirmPasswordValidation = validateConfirmPassword(String(data.password ?? ''), String(data.confirmPassword ?? ''));
  if (!confirmPasswordValidation.valid) errors.confirmPassword = confirmPasswordValidation.error || '';

  console.log("Nombres:", data.nombres)
  console.log("Apellidos:", data.apellidos)
  console.log("tipo de Documento:", data.tipoDocumento)
  console.log("numeroDocumento:", data.numeroDocumento)
  console.log("correo:", data.correo)
  console.log("telefono:", data.telefono)
  console.log("tipoVinculacion:", data.tipoVinculacion)
  console.log("empresaProveedora:", data.empresaProveedora)

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
