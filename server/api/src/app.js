import express from 'express';

import authRouter from './modules/auth/auth.router.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { envVariables } from './configs/env.config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: envVariables.CLIENT_URL,
    credentials: true, // allows cookies (refreshToken)
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.get('/', async (req, res) => {
  res.send({ message: 'server is serving' });
});
// app.use('/api', conversationRouter);
app.use('/api/auth', authRouter);
app.use(errorMiddleware);
// Global Error Middleware - Should always be in the end of middlewares : )

export { app };
