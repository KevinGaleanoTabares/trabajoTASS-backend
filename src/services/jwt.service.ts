  import jwt from 'jsonwebtoken';
  import { env } from '../config/env.js';
  import type { JwtPayload } from '../utils/enums_types_interfaces.js'

  export function generateVerificationToken(userId: string): string {
    return jwt.sign(
      { id: userId, type: 'verify-email' },
      env.jwtSecret,
      { expiresIn: '1d' }
    );
  }

  export function verifyToken(token: string) {
    return jwt.verify(token, env.jwtSecret);
  }

  export function generateAuthToken(user: {
  _id: unknown;
  nombres: string;
  apellidos: string;
  correo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  tipoVinculacion: string;
  rolSistema: string;
  cargo: string;
  estado: string;
}) {

  const payload: JwtPayload = {
    id: String(user._id),
    nombres: user.nombres,
    apellidos: user.apellidos,
    correo: user.correo,
    tipoDocumento: user.tipoDocumento,
    numeroDocumento: user.numeroDocumento,
    telefono: user.telefono,
    tipoVinculacion: user.tipoVinculacion,
    rolSistema: user.rolSistema,
    cargo: user.cargo,
    estado: user.estado,
  };

  return jwt.sign(
    payload,
    env.jwtSecret,
    {
      expiresIn: '1h',
    }
  );
}