import mongoose, { Document } from 'mongoose';

export interface IConflictAuditLog {
  accion: string;
  usuario: mongoose.Types.ObjectId;
  fecha: Date;
  detalles: string;
}

export type ConflictLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export type ConflictStatus =
  | 'PENDIENTE'
  | 'EN_INVESTIGACION'
  | 'RESUELTO'
  | 'DESCARTADO'
  | 'ESCALADO';

export interface IConflictInvolved {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  documento: string;
  tipo: string;
  rol: string;
  tipoVinculacion: string;
  correo: string;
  telefono: string;
  area?: string | null;
  empresa?: string | null;
  nit?: string | null;
};

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
export interface IConflict extends Document {
  codigo: string;
  nivel: ConflictLevel;
  estado: ConflictStatus;

  fechaDeteccion: Date;
  usuarioDeclarante: mongoose.Types.ObjectId;
  categoria: | 'EMPLEADO' | 'ADMINISTRATIVO' | 'DIRECTIVO' | 'PROVEEDOR';

  fechaResolucion?: Date | null;
  involucrados: IConflictInvolved[];

  coincidencias: string[];

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

export interface IfamilyRelationship {
    usuario: mongoose.Types.ObjectId;
    familiar: mongoose.Types.ObjectId;
    parentesco: string;
    fechaDeclaracion: Date;
    fechaConflicto?: Date | null;
}

export type ActiveUser = {
  _id: unknown;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  tipoVinculacion: string;
  rolSistema: string;
  cargo: string;
  estado: string;
  empresaProveedora?: {
    _id: unknown;
    nit: string;
    nombre: string;
    estado: string;
  } | null;
};

