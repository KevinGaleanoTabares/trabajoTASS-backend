import mongoose, { Schema } from 'mongoose';
import type{ IfamilyRelationship } from '../utils/enums_types_interfaces.js'

const familyRelationshipSchema = new Schema<IfamilyRelationship>(
    {
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        familiar: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        parentesco: {
            type: String,
            required: true,
            trim: true,
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
        timestamps: true
    },

);

familyRelationshipSchema.index(
    { usuario: 1, familiar: 1},
    { unique: true },
);

export const familyRelationshipModel = mongoose.model<IfamilyRelationship>('FamilyRelationship', familyRelationshipSchema, );