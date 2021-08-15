import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { Document, ObjectId, SchemaTypes } from "mongoose"
import { ContentType } from "../enums/content-type.enum"
import { Reason } from "../enums/reason.enum"
import { ReportStatus } from "../enums/status.enum"

@Schema({ timestamps: true })
export class Report {

    @Prop({ required: true })
    contentType: ContentType

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: () => {
        // @ts-ignore this.contentType could be undefined, needs to be ignored, because field is set to required so it will never be undefined
        switch(this.contentType) {
            case ContentType.SET:
                return 'Set'
            case ContentType.TASK:
                return 'Task'
            case ContentType.USER:
                return 'User'
        }}})
    content: ObjectId

    @Prop({ default: Reason.OTHER })
    reason: Reason

    @Prop({ default: ReportStatus.PENDING})
    status: ReportStatus

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    reportedBy: ObjectId

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    closedBy: ObjectId
}

export type ReportDocument = Report & Document
export const ReportSchema = SchemaFactory.createForClass(Report)
