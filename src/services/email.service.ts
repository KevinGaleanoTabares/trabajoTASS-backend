import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.mailHost,
  port: Number(env.mailPort),
  auth: {
    user: env.mailUser,
    pass: env.mailPass,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
) {
  const verificationLink =
  `http://localhost:3000/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: env.mailFrom,
    to: email,
    subject: 'Verifica tu cuenta de TASS',
    html: `
      <h2>Bienvenido a TASS</h2>

      <p>Gracias por registrarte.</p>

      <p>Haz clic en el siguiente botón para activar tu cuenta:</p>

      <a href="${verificationLink}"
         style="padding:12px 20px;background:#0456F4;color:white;text-decoration:none;border-radius:6px;">
         Verificar correo
      </a>

      <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
    `,
  });
}