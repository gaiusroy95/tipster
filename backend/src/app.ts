import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { errorMiddleware } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import { oauthRouter } from './routes/oauth.routes';
import { twoFactorRouter } from './routes/two-factor.routes';
import { healthRouter } from './routes/health.routes';
import { sportsRouter } from './routes/sports.routes';
import { apiRouter } from './routes/api.routes';
import { forumRouter } from './routes/forum.routes';
import { adminRouter } from './routes/admin.routes';

function buildCorsOptions(): cors.CorsOptions {
  const origins = [
    process.env.FRONTEND_URL?.trim(),
    process.env.ADMIN_FRONTEND_URL?.trim() || 'http://localhost:5174',
  ].filter(Boolean) as string[];

  if (origins.length === 0) {
    return {};
  }

  return {
    origin: origins,
    credentials: true,
  };
}

export function createApp() {
  const app = express();

  app.set('trust proxy', true);
  app.use(cors(buildCorsOptions()));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use(healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/auth/oauth', oauthRouter);
  app.use('/api/auth/2fa', twoFactorRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', apiRouter);
  app.use('/api/forum', forumRouter);
  app.use('/sports', sportsRouter);

  app.use(errorMiddleware);

  return app;
}
