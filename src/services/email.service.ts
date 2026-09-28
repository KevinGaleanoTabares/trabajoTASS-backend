import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import ejs from 'ejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExternalServiceError } from '../utils/errors.js';

const transporter = nodemailer.createTransport({
  host: env.mailHost,
  port: Number(env.mailPort),
  auth: {
    user: env.mailUser,
    pass: env.mailPass,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function sendVerificationEmail(
  email: string,
  token: string,
) {

  try {

    const verificationLink =
      `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;// para el back

    const templatePath = path.join(
      __dirname,
      '../templates/emails/verify-email.ejs',
    );

    const html = await ejs.renderFile(templatePath, { verificationLink });

    await transporter.sendMail({
      from: env.mailFrom,
      to: email,
      subject: 'Verifica tu cuenta de TASS',
      html,
      attachments: [
        {
          filename: 'logo-tass.png',
          path: path.join(
            __dirname,
            '../assets/images/logo-tass.png'
          ),
          cid: 'tass-logo',
        },
      ],
    });
  } catch (error: unknown) {
    console.error('Error enviando correo de verificación: ', error);

    throw new ExternalServiceError(
      'Correo',
      'No fue posible enviar el correo de verificación.'
    );
  }


}