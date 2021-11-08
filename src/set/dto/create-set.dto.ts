import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, validate } from "class-validator"
import { Language } from "../../shared/enums/language.enum"

export class CreateSetDto  {
    @IsString()
    @IsNotEmpty()
    @Length(3, 32)
    name: string

    @IsOptional()
    @IsEnum(Language)
    language: Language = Language.DE
}
