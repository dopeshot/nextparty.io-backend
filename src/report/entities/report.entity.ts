import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { Reason } from "../enums/reason.enum"
import { Severity } from "../enums/severity.enum"

@Schema({ timestamps: true })
export class Report {
    @Prop({ required: true })
    reportID: number

    @Prop({ required: true })
    taskID: number

    @Prop({ required: true, default: Reason.Other })
    reason: Reason

    @Prop({ required: true })
    userID: number

    @Prop()
    severity: Severity
}

export type ReportDocument = Report & Document
export const ReportSchema = SchemaFactory.createForClass(Report)
