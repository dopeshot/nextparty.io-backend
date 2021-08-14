import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportDocument } from './entities/report.entity';

@Injectable()
export class ReportService {
    constructor(@InjectModel('Report') private reportSchema: Model<ReportDocument>) { }

    /**
     * Create new Report
     * @param metaData 
     * @returns created report
     */
    async create(metaData: CreateReportDto, user: JwtUserDto): Promise<Report> {
        try {
            const report = new this.reportSchema({
                ...metaData,
                reportedBy: user.userId
            })
            const result = await report.save()

            return result
        } catch (error) {
            throw new InternalServerErrorException("Create new report failed", error)
        }
    }

    /**
     * Get all reports
     * @returns Array of Reports
     */
    async findAll(): Promise<Report[]> {
        return await this.reportSchema.find()
    }

    /**
     * Find Report by Id
     * @param id of the report
     * @returns Report
     */
    async findOneById(id: ObjectId): Promise<Report> {
        let report = await this.reportSchema.findById(id).lean()
        
        if (!report)
            throw new NotFoundException()

        return report;
    }

    /**
     * Hard Delete report
     * @param id of the report
     * @returns Removed Report
     */
    async remove(id: ObjectId): Promise<Report> {
        // Check if there is a report with this id and remove it
        const report = await this.reportSchema.findByIdAndDelete(id)
        
        if (!report)
            throw new NotFoundException()

        // We have to return here to exit process
        return report
    }
}
