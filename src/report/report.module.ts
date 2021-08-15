import { Module } from '@nestjs/common'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ReportSchema } from './entities/report.entity'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule, MongooseModule.forFeature([{ name: 'Report', schema: ReportSchema }])],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
