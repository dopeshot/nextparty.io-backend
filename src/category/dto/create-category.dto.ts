import { IsEnum, IsMongoId, IsNotEmpty, IsObject, IsString } from "class-validator";
import { ObjectId } from "mongoose";
import { Set } from "src/set/entities/set.entity";
import { Language } from "src/task/enums/language.enum";

export class CreateCategoryDto {
    @IsEnum(Language)
    @IsNotEmpty()
    language: Language

    @IsString()
    @IsNotEmpty()
    name: string
    
    @IsMongoId()
    @IsNotEmpty()
    author: ObjectId

    @IsMongoId()
    set: ObjectId[]
}
