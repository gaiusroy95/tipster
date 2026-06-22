import { Module } from '@nestjs/common'
import { SportsController } from './sports.controller'
import { SportsService } from './sports.service'
import { OvertimeModule } from '../overtime/overtime.module'

@Module({
  imports: [OvertimeModule],
  controllers: [SportsController],
  providers: [SportsService],
})
export class SportsModule {}
