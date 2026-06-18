import express from 'express';

import authRouter from './modules/auth/auth.router.js';
import conversationsRouter from './modules/conversations/conversations.router.js';
import webHooksRouter from './modules/webhooks/webhooks.router.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { envVariables } from './configs/env.config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
app.set('trust proxy', 1); // To get real ip
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
app.get('/api/health-check', async (req, res) => {
  res.send({ message: 'Healthy!' });
});
// app.use('/api', conversationRouter);
app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/webhooks', webHooksRouter);
app.use(errorMiddleware);
// Global Error Middleware - Should always be in the end of middlewares : )

export { app };
