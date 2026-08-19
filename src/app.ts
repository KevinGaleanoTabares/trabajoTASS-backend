import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.ts.js';
import { authRouter } from './routes/auth.routes.js';

export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.frontendUrl,
  }),
);

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    message: 'API de TASS funcionando',
  });
});

app.use('/api/auth', authRouter);
app.use(errorHandler);