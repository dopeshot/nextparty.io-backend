import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Language } from '../../shared/enums/language.enum';

export class CreateSetDto {
    @IsString()
    @Length(3, 32)
    name: string;

    @IsOptional()
    @IsEnum(Language)
    language: Language = Language.DE;
}
