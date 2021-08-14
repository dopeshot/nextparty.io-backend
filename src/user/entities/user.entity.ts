import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, ObjectId } from "mongoose"
import { Role } from "../enums/role.enum"
import { Status } from "../enums/status.enum"

@Schema({ timestamps: true })
export class User {
    _id: ObjectId

    @Prop({ required: true })
    username: string

    @Prop({ required: true, unique: true })
    email: string

    // Need to be ignored (throws undefined error) because we want to look if provider is undefined or not, if it is undefined, required is set to true 
    // @ts-ignore 
    @Prop({ required: () => this.provider ? true : false})
    password: string

    @Prop({ default: Role.User })
    role: Role

    @Prop({ default: Status.Active })
    status: Status

    @Prop()
    provider: string
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)
