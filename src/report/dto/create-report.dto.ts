import { IsEnum, IsMongoId, IsOptional } from "class-validator"
import { ObjectId } from "mongoose"
import { ContentType } from "../enums/content-type.enum"
import { Reason } from "../enums/reason.enum"

export class CreateReportDto  {
    @IsEnum(ContentType)
    contentType: ContentType

    @IsMongoId()
    content: ObjectId

    @IsOptional()
    @IsEnum(Reason)
    reason: Reason
}
