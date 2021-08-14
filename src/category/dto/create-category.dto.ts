import { IsEnum, IsMongoId, IsNotEmpty, IsString, Length } from "class-validator"
import { ObjectId } from "mongoose"
import { Language } from "../../task/enums/language.enum";

export class CreateCategoryDto {
    @IsEnum(Language)
    @IsNotEmpty()
    language: Language

    @IsString()
    @IsNotEmpty()
    @Length(3,124)
    name: string
    
    @IsMongoId()
    @IsNotEmpty()
    author: ObjectId

    @IsMongoId()
    set: ObjectId[]
}
