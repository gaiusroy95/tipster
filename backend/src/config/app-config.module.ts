import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import overtimeConfig, { cacheConfig, pollingConfig } from './configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [overtimeConfig, cacheConfig, pollingConfig],
    }),
  ],
})
export class AppConfigModule {}
