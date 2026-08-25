import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.js';
import { validateRegistration } from '../validators/registration.validator.js';
import {
  ValidationError,
  ConflictError,
  DatabaseError,
} from '../utils/errors.js';
import { CompanyModel } from '../models/company.js';
import { generateAuthToken, generateVerificationToken, verifyToken} from '../services/jwt.service.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { env } from '../config/env.js';

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
      empresaProveedora,
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
      empresaProveedora,
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

    // Si es proveedor, verificar que la empresa exista
    if (tipoVinculacion === 'proveedor') {

      const company = await CompanyModel.exists({
        _id: empresaProveedora,
      });

      if (!company) {
        throw new ValidationError(
          'La empresa seleccionada no existe.',
          {
            empresaProveedora: 'Empresa inválida.',
          }
        );
      }

    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    console.log({
      tipoVinculacion,
      empresaProveedora,
    });

    const user = await UserModel.create({
      nombres: String(nombres).trim(),
      apellidos: String(apellidos).trim(),
      tipoDocumento,
      numeroDocumento: normalizedDocument,
      correo: normalizedEmail,
      telefono: String(telefono).trim(),
      tipoVinculacion,
      empresaProveedora: tipoVinculacion === 'proveedor'? empresaProveedora: null,
      cargo: String(cargo).trim(),
      passwordHash,
      rolSistema: 'usuario',
      estado: 'PENDIENTE',
    }).catch((error) => {
      console.error('ERROR REAL DE MONGO:', error);
      throw new DatabaseError(
        'No fue posible crear el usuario.',
        error
      );
    });

    const verificationToken = generateVerificationToken(
      user._id.toString()
    );

    await sendVerificationEmail(
      user.correo,
      verificationToken
    );
    

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

export async function verifyEmail(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {

  try {

    const token = String(request.query.token);

    const payload = verifyToken(token) as {
      id: string;
      type: string;
    };

    console.log(payload);

    if (payload.type !== 'verify-email') {
      response.status(400).send('Token inválido');
      return;
    }

    await UserModel.findByIdAndUpdate(
      payload.id,
      { estado: 'ACTIVO' }
    );

    response.redirect(`${env.frontendUrl}/login?verified=true`);

  } catch (error) {
    next(error);
  }


}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const { correo, password } = request.body;

    const user = await UserModel.findOne({
      correo: String(correo).toLowerCase().trim(),
    }).select('+passwordHash');

    if (!user) {
      throw new ConflictError(
        'Correo o contraseña incorrectos.',
        'User',
      );
    }

    const passwordCorrecta = await bcrypt.compare(
      String(password),
      user.passwordHash,
    );

    if (!passwordCorrecta) {
      throw new ConflictError(
        'Correo o contraseña incorrectos.',
        'User',
      );
    }

    if (user.estado !== 'ACTIVO') {
      throw new ConflictError(
        'Debes activar tu cuenta para iniciar sesión',
        'User',
      );
    }

    const token = generateAuthToken(
      user._id.toString(),
      user.rolSistema,
    );

    response.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          nombres: user.nombres,
          correo: user.correo,
          estado: user.estado,
        },
      },
    });

  } catch (error) {
    next(error);
  }
}