import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  Logger.log(`Sports API running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap().catch((error: NodeJS.ErrnoException) => {
  const port = process.env.PORT ?? 3001;

  if (error?.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${port} is already in use (another backend instance is probably still running).\n` +
        `Fix (recommended): npm run free-port   then   npm run start:dev\n` +
        `Git Bash manual fix:\n` +
        `  netstat -ano | grep :${port}\n` +
        `  taskkill //PID <pid> //F    (note double slashes in Git Bash)\n`,
    );
  } else {
    console.error('Failed to start application:', error);
  }
  process.exit(1);
});
