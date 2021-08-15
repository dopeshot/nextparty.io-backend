import { IsEnum, IsMongoId } from "class-validator"
import { ObjectId } from "mongoose"
import { Reason } from "../enums/reason.enum"

export class CreateReportDto  {
    @IsMongoId()
    contentType: ObjectId

    @IsMongoId()
    contentId: ObjectId

    @IsEnum(Reason)
    reason: Reason
}
