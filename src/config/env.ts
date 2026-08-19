import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const nodeEnv = process.env.NODE_ENV ?? 'local';
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);

if (!fs.existsSync(envPath)) {
    throw new Error(`No existe el archivo de entorno: ${envPath}`);
}

dotenv.config({ path: envPath });

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('Falta la variable MONGO_URI en el archivo de entorno');
}

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
    throw new Error('Falta la variable FRONTEND_URL en el archivo de entorno.');
}

export const env = {
    nodeEnv,
    port: Number(process.env.PORT ?? 3000),
    mongoUri,
    frontendUrl,
};