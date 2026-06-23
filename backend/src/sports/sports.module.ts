import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 21600 * 1000,
    }),
  ],
  controllers: [SportsController],
  providers: [SportsService],
  exports: [SportsService],
})
export class SportsModule {}
