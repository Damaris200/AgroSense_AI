import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error';
import farmRoutes           from './routes/farm.routes';
import authRoutes           from './routes/auth.routes';
import recommendationRoutes from './routes/recommendation.routes';
import notificationRoutes   from './routes/notification.routes';
import weatherRoutes        from './routes/weather.routes';
import soilRoutes           from './routes/soil.routes';
import adminRoutes          from './routes/admin.routes';
import overviewRoutes       from './routes/overview.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth',            authRoutes);
  app.use('/api/farm',            farmRoutes);
  app.use('/api/weather',         weatherRoutes);
  app.use('/api/soil',            soilRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/notifications',   notificationRoutes);
  app.use('/api/admin',           adminRoutes);
  app.use('/api/overview',         overviewRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
