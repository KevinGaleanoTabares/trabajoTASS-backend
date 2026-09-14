import type { JwtPayload } from './enums_types_interfaces.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};