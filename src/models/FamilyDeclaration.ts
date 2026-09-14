import { Schema, model, type InferSchemaType } from 'mongoose';

const familyDeclarationSchema = new Schema(
  {
    declarante: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    familiar: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tipoVinculo: {
      type: String,
      required: true,
      enum: [
        'Padre',
        'Madre',
        'Primo',
        'Prima',
        'Hijo',
        'Hija',
        'Esposo',
        'Esposa',
        'Amante',
        'Pareja',
        'Tio',
        'Tia',
      ],
    },

    fechaDeclaracion: {
      type: Date,
      default: Date.now,
      required: true,
    },

    fechaConflicto: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type FamilyDeclarationDocument =
  InferSchemaType<typeof familyDeclarationSchema>;

export const FamilyDeclarationModel =
  model('FamilyDeclaration', familyDeclarationSchema);