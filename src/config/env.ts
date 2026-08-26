import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const nodeEnv = process.env.NODE_ENV ?? 'local';
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}


const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error('Falta la variable MONGO_URI en el entorno');
}


const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
    throw new Error('Falta la variable FRONTEND_URL en el entorno.');
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('Falta el la variable jwtSecret en el entorno');
}

export const env = {
    nodeEnv,
    port: Number(process.env.PORT ?? 3000),
    mongoUri,
    frontendUrl,
    jwtSecret,
    mailHost: process.env.MAIL_HOST!,
    mailPort: process.env.MAIL_PORT!,
    mailUser: process.env.MAIL_USER!,
    mailPass: process.env.MAIL_PASS!,
    mailFrom: process.env.MAIL_FROM!,
};
