import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT') ?? Number(process.env.PORT ?? 3000)
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? process.env.FRONTEND_URL ?? 'http://localhost:5173'

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  })

  await app.listen(port)
  Logger.log(`Sports API listening on http://localhost:${port}/api`, 'Bootstrap')
}

bootstrap()
