import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';


const companySchema = new Schema(
    {
        nit: {
            type: String,
            required: true,
            unique: true,
            trim: true
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      default: 'ACTIVA'
    }
  },
  {
    timestamps: true
  }
);

export type CompanyDocument = InferSchemaType<typeof companySchema>;

export const CompanyModel = model('Company', companySchema);
