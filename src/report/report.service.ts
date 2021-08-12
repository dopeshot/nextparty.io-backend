import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportDocument } from './entities/report.entity';

@Injectable()
export class ReportService {
    constructor(@InjectModel('Report') private reportSchema: Model<ReportDocument>) { }

    async create(metaData: CreateReportDto): Promise<ReportDocument> {
        try {
            const report = new this.reportSchema({
            ...metaData
            })
            const result = await report.save()

            return result
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }

    async findAll(): Promise<ReportDocument[]> {
        return await this.reportSchema.find()
    }

    findOne(id: number) {
        return `This action returns a #${id} report`;
    }

    remove(id: number) {
        return `This action removes a #${id} report`;
    }
}
