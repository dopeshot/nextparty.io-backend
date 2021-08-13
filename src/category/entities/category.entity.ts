import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import { ObjectId, SchemaTypes } from "mongoose"
import { Language } from "src/task/enums/language.enum";
import { Set } from "../../set/entities/set.entity";

@Schema({ timestamps: true })
export class Category {
    @Prop({})
    language: Language

    @Prop({})
    name: string

    @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Set' }] })
    set: ObjectId[]

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    author: ObjectId
}

export type CategoryDocument = Category & Document
export const CategorySchema = SchemaFactory.createForClass(Category)