import { Schema, model, type InferSchemaType } from 'mongoose';

const authorizedPersonSchema = new Schema({
    tipoDocumento: {
        type: String,
        required: true,
        enum: ['CC', 'CE', 'NIT', 'PASAPORTE'],
    },

    numeroDocumento: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    cargo: {
      type: String,
      required: true,
      trim: true,
    },

    estado: {
      type: String,
      required: true,
      enum: ['ACTIVO', 'INACTIVO'],
      default: 'ACTIVO',
    },
  },
  {
    timestamps: true,
  },
);

export type AuthorizedPersonDocument =
  InferSchemaType<typeof authorizedPersonSchema>;

export const AuthorizedPersonModel =
  model('AuthorizedPerson', authorizedPersonSchema
);