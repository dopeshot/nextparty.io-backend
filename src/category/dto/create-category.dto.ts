import { Type } from "class-transformer";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { ObjectId } from "mongoose";
import { Language } from "../../shared/enums/language.enum";

export class CreateCategoryDto {
    @IsEnum(Language)
    language: Language

    @IsString()
    @Length(3,124)
    name: string

    @IsMongoId({ each: true })
    @IsOptional()
    set: ObjectId[]
}
