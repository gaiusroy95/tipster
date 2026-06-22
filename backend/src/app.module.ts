import { Module } from '@nestjs/common'
import { AppConfigModule } from './config/app-config.module'
import { CacheModule } from './cache/cache.module'
import { SportsModule } from './sports/sports.module'

@Module({
  imports: [AppConfigModule, CacheModule, SportsModule],
})
export class AppModule {}
