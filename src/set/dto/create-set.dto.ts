import { IsNotEmpty, IsString, Length } from "class-validator"
import { Language } from "src/shared/enums/language.enum"

export class CreateSetDto  {
    @IsString()
    @IsNotEmpty()
    @Length(3, 32)
    name: string

    @IsString()
    language: Language | Language.DE
}
