import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
