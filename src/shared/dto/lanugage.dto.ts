import { IsEnum, IsOptional } from 'class-validator';
import { Language } from '../enums/language.enum';

export class LanguageDto {
    @IsOptional()
    @IsEnum(Language)
    lang: Language;
}
