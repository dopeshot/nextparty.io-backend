import { IsNumber, Length } from "class-validator"

export class CreateReportDto  {
    @IsNumber()
    // TODO: How does a task ID look like? Set length
    @Length(0, 124)
    taskID: number

    @IsNumber()
    // TODO: How does a user ID look like? Set length
    @Length(0, 124)
    userID: number

    @IsNumber()
    reason: number
}
