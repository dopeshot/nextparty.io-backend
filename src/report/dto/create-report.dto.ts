import { IsEnum, IsMongoId, IsNumber, Length } from "class-validator"
import { ObjectId } from "mongoose"
import { Reason } from "../enums/reason.enum"

export class CreateReportDto  {
    @IsMongoId()
    // TODO: How does a task ID look like? Set length
    taskID: ObjectId

    @IsMongoId()
    // TODO: How does a user ID look like? Set length
    userID: ObjectId

    @IsEnum(Reason)
    reason: Reason
}
