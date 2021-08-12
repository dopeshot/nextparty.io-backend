import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { ObjectId } from "mongoose"
import { Reason } from "../enums/reason.enum"
import { Severity } from "../enums/severity.enum"

@Schema({ timestamps: true })
export class Report {

    _id: ObjectId

    @Prop({ required: true })
    taskID: string

    @Prop({ required: true, default: Reason.Other })
    reason: Reason

    @Prop({ required: true })
    userID: string

    @Prop()
    severity: Severity
}

export type ReportDocument = Report & Document
export const ReportSchema = SchemaFactory.createForClass(Report)
