import cors from 'cors';
import express from 'express';
import { errorMiddleware } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import { oauthRouter } from './routes/oauth.routes';
import { healthRouter } from './routes/health.routes';
import { sportsRouter } from './routes/sports.routes';
import { apiRouter } from './routes/api.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/auth/oauth', oauthRouter);
  app.use('/api', apiRouter);
  app.use('/sports', sportsRouter);

  app.use(errorMiddleware);

  return app;
}
