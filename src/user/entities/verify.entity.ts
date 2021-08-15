import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { ObjectId, SchemaTypes, Document } from 'mongoose'

@Schema({ timestamps: true })
export class EmailVerify {
    _id: ObjectId

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    userId: ObjectId

    @Prop({required: true, unique:true})
    verificationCode: string
}

export type VerifyDocument = EmailVerify & Document
export const VerifySchema = SchemaFactory.createForClass(EmailVerify)