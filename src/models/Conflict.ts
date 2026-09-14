import mongoose, { Schema } from 'mongoose';
import type { IConflict } from '../utils/enums_types_interfaces.js';


const conflictSchema = new Schema<IConflict>(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    nivel: {
      type: String,
      enum: ['BAJO', 'MEDIO', 'ALTO'],
      required: true,
    },

    estado: {
      type: String,
      enum: [
        'PENDIENTE',
        'EN_INVESTIGACION',
        'RESUELTO',
        'DESCARTADO',
        'ESCALADO',
      ],
      default: 'PENDIENTE',
      required: true,
    },

    fechaDeteccion: {
      type: Date,
      default: Date.now,
      required: true,
    },

    fechaResolucion: {
      type: Date,
      default: null,
    },

    involucrados: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },

        nombre: {
          type: String,
          required: true,
        },

        documento: {
          type: String,
          required: true,
        },

        tipo: {
          type: String,
          required: true,
        },

        rol: {
          type: String,
          required: true,
        },

        area: String,

        empresa: String,

        nit: String,
      },
    ],

    descripcion: {
      type: String,
      required: true,
      trim: true,
    },

    evidencias: [
      {
        tipo: {
          type: String,
          enum: ['documento', 'imagen'],
          required: true,
        },

        nombre: {
          type: String,
          required: true,
        },

        url: {
          type: String,
          required: true,
        },

        fechaSubida: {
          type: Date,
          default: Date.now,
        },

        subidoPor: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],

    investigadorAsignado: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },

      nombre: String,

      fechaAsignacion: Date,
    },

    notas: [
      {
        texto: {
          type: String,
          required: true,
        },

        fecha: {
          type: Date,
          default: Date.now,
        },

        usuario: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },

        tipo: {
          type: String,
          enum: ['observacion', 'resolucion', 'escalamiento'],
          required: true,
        },
      },
    ],

    resolucion: {
      descripcion: String,

      fecha: Date,

      usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },

      accionTomada: String,
    },

    auditLog: [
      {
        accion: {
          type: String,
          required: true,
        },

        usuario: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },

        fecha: {
          type: Date,
          default: Date.now,
        },

        detalles: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const ConflictModel = mongoose.model<IConflict>(
  'Conflict',
  conflictSchema,
);