import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
    {
        nombres: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },
        apellidos: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },
        tipoDocumento: {
            type: String,
            required: true,
            enum: ['CC', 'CE', 'NIT', 'PASAPORTE'],
        },
        numeroDocumento: {
            type: String,
            required: true,
            trim: true,
            match: /^[a-zA-Z0-9]+$/,
        },
        correo: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        telefono: {
            type: String,
            required: true,
            match: /^\d{10,}$/,
        },
        tipoVinculacion: {
            type: String,
            required: true,
            enum: ['empleado', 'administrativo', 'directivo', 'proveedor'],
        },
        rolSistema: {
            type: String,
            required: true,
            enum: ['usuario', 'admin', 'superAdmin'],
            default: 'usuario',
        },
        cargo: {
            type: String,
            required: true,
            trim: true,
        },
        empresaProveedora: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            default: null,
        },
        estado: {
            type: String,
            required: true,
            enum: ['PENDIENTE', 'ACTIVO', 'INACTIVO'],
            default: 'PENDIENTE',
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
        
    },
);

userSchema.index(
    {tipoDocumento: 1, numeroDocumento: 1},
    { unique: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
