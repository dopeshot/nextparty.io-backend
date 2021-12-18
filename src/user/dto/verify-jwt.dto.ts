import { IsEmail, isNumber, IsString} from 'class-validator'
import { isValidObjectId, Schema } from 'mongoose'

export class MailVerifyJWTDto {
    @IsEmail()
    mail: string

    @IsString()
    name: string

    id: Schema.Types.ObjectId
}
