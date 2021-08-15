import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose"
import { ObjectId, SchemaTypes } from "mongoose"
import { Language } from "../../task/enums/language.enum";
import { User } from "../../user/entities/user.entity";
import { CategoryStatus } from "../enums/categoryStatus.enum";

@Schema({ timestamps: true })
export class Category {
    @Prop({})
    language: Language

    @Prop({})
    name: string

    @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Set' }] })
    set: ObjectId[]

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    author: User

    @Prop({ default: CategoryStatus.ACTIVE })
    status: CategoryStatus
}

export type CategoryDocument = Category & Document
export const CategorySchema = SchemaFactory.createForClass(Category)