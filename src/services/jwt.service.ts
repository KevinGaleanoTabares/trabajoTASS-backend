  import jwt from 'jsonwebtoken';
  import { env } from '../config/env.js';

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

  export function generateAuthToken(
    userId: string,
    rol: string,
  ) {
    return jwt.sign(
      {
        id: userId,
        rol,
        type: 'auth',
      },
      env.jwtSecret,
      { expiresIn: '8h' },
    );
  }