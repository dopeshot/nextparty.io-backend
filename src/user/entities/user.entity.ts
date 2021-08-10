import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Status } from "../enums/status.enum"

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string

    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop()
    role: string

    @Prop()
    status: Status
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)
