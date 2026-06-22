import { Module } from '@nestjs/common'
import { OvertimeApiClient } from './overtime-api.client'

@Module({
  providers: [OvertimeApiClient],
  exports: [OvertimeApiClient],
})
export class OvertimeModule {}
