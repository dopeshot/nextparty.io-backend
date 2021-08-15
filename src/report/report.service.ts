import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose'
import { JwtUserDto } from 'src/auth/dto/jwt.dto'
import { PaginationPayload } from '../shared/interfaces/paginationPayload.interface';
import { SharedService } from '../shared/shared.service';
import { CreateReportDto } from './dto/create-report.dto'
import { Report, ReportDocument } from './entities/report.entity'
import { DeleteType } from './enums/delete-type';
import { ReportStatus } from './enums/status.enum';

@Injectable()
export class ReportService {
    constructor(@InjectModel('Report') private reportSchema: Model<ReportDocument>,
    private readonly sharedService: SharedService) { }

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
            throw new InternalServerErrorException("Create new report failed")
        }
    }

    /**
     * Get all reports
     * @returns Array of Reports
     */
    async findAll(page: number, limit: number): Promise<PaginationPayload<Report>> {
        const documentCount = await this.reportSchema.estimatedDocumentCount()
        const reports: Report[] = await this.reportSchema.find().limit(limit).skip(limit * page)
        // TODO: Implement pagination
        return await this.sharedService.createPayloadWithPagination(documentCount, page, limit, reports)
    }

    /**
     * Find Report by Id
     * @param id of the report
     * @returns Report
     */
    async findOneById(id: ObjectId): Promise<Report> {
        let report = await this.reportSchema.findById(id)

        if (!report)
            throw new NotFoundException()

        return report;
    }

    /**
     * Delete report: If type is hard ==> hard delete, If type is soft => soft delete
     * @param id of the report
     * @param type soft or hard delete
     */
    async remove(id: ObjectId, type: DeleteType, user: JwtUserDto): Promise<void> {
        // Check query
        const isHardDelete = type ? type.includes('hard') : false

        // true is for admin check later
        if (true && isHardDelete) {
            // Check if there is a task with this id and remove it
            const report = await this.reportSchema.findByIdAndDelete(id)
            if (!report)
                throw new NotFoundException()

            return
        }

        // Soft delete
        const report = await this.reportSchema.findByIdAndUpdate(id, {
            status: ReportStatus.DELETED,
            closedBy: user.userId
        }, {
            new: true
        })
        if (!report)
            throw new NotFoundException()
    }
}
