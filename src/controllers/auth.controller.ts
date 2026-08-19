import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.js';
import { validateRegistration } from '../validators/registration.validator.js';
import {
  ValidationError,
  ConflictError,
  DatabaseError,
} from '../utils/errors.js';

export async function register(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      correo,
      telefono,
      tipoVinculacion,
      cargo,
      password,
      confirmPassword,
    } = request.body;

    const validation = validateRegistration({
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      correo,
      telefono,
      tipoVinculacion,
      cargo,
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      throw new ValidationError('Los datos proporcionados no son válidos.', validation.errors);
    }

    const normalizedEmail = String(correo).toLowerCase().trim();
    const normalizedDocument = String(numeroDocumento).trim();

    const emailExists = await UserModel.exists({ correo: normalizedEmail });
    if (emailExists) {
      throw new ConflictError('Ya existe una cuenta registrada con este correo electrónico.', 'User');
    }

    const documentExists = await UserModel.exists({
      tipoDocumento,
      numeroDocumento: normalizedDocument,
    });

    if (documentExists) {
      throw new ConflictError('Ya existe una cuenta registrada con este tipo y número de documento.', 'User');
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await UserModel.create({
      nombres: String(nombres).trim(),
      apellidos: String(apellidos).trim(),
      tipoDocumento,
      numeroDocumento: normalizedDocument,
      correo: normalizedEmail,
      telefono: String(telefono).trim(),
      tipoVinculacion,
      cargo: String(cargo).trim(),
      passwordHash,
      rolSistema: 'usuario',
      estado: 'PENDIENTE',
    }).catch((error) => {
      throw new DatabaseError('No fue posible crear el usuario. Intenta nuevamente.', error);
    });

    response.status(201).json({
      success: true,
      message: 'Usuario creado correctamente. La cuenta está pendiente de activación.',
      data: {
        user: {
          id: user._id,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          estado: user.estado,
          tipoVinculacion: user.tipoVinculacion,
        },
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}