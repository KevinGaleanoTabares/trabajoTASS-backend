import mongoose, { Document } from 'mongoose';

export type ConflictLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export type ConflictStatus =
  | 'PENDIENTE'
  | 'EN_INVESTIGACION'
  | 'RESUELTO'
  | 'DESCARTADO'
  | 'ESCALADO';

export interface IConflictInvolved {
  userId?: mongoose.Types.ObjectId;
  nombre: string;
  documento: string;
  tipo: string;
  rol: string;
  area?: string;
  empresa?: string;
  nit?: string;
}

export interface IConflictEvidence {
  tipo: 'documento' | 'imagen';
  nombre: string;
  url: string;
  fechaSubida: Date;
  subidoPor: mongoose.Types.ObjectId;
}

export interface IConflictNote {
  texto: string;
  fecha: Date;
  usuario: mongoose.Types.ObjectId;
  tipo: 'observacion' | 'resolucion' | 'escalamiento';
}

export interface IConflictAuditLog {
  accion: string;
  usuario: mongoose.Types.ObjectId;
  fecha: Date;
  detalles: string;
}

export interface IConflict extends Document {
  codigo: string;
  nivel: ConflictLevel;
  estado: ConflictStatus;

  fechaDeteccion: Date;
  fechaResolucion?: Date | null;

  involucrados: IConflictInvolved[];

  descripcion: string;

  evidencias: IConflictEvidence[];

  investigadorAsignado?: {
    userId: mongoose.Types.ObjectId;
    nombre: string;
    fechaAsignacion: Date;
  } | null;

  notas: IConflictNote[];

  resolucion?: {
    descripcion: string;
    fecha: Date;
    usuario: mongoose.Types.ObjectId;
    accionTomada: string;
  } | null;

  auditLog: IConflictAuditLog[];

  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  id: string;
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
  type?: string;
}

export type TipoDocumento =
  | 'CC'
  | 'CE'
  | 'NIT'
  | 'PASAPORTE';

export type TipoVinculo =
  | 'Padre'
  | 'Madre'
  | 'Primo'
  | 'Prima'
  | 'Hijo'
  | 'Hija'
  | 'Esposo'
  | 'Esposa'
  | 'Amante'
  | 'Pareja'
  | 'Tio'
  | 'Tia';

