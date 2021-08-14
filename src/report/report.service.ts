import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportDocument } from './entities/report.entity';

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

    async findAll(): Promise<Report[]> {
        return await this.reportSchema.find()
    }

    async findOne(id: ObjectId): Promise<Report> {
        let report = await this.reportSchema.findById(id).lean()
        if (!report)
            throw new NotFoundException()

        return report;
    }

    // hard delete report
    async remove(id: ObjectId): Promise<void> {
        // Check if there is a report with this id and remove it
        const report = await this.reportSchema.findByIdAndDelete(id)
        if (!report)
            throw new NotFoundException()

        // We have to return here to exit process
        return
    }
}
