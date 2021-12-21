import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length
} from 'class-validator';
import { Language } from '../../shared/enums/language.enum';

export class CreateSetDto {
    @IsString()
    @IsNotEmpty() // MC: can get removed due Length
    @Length(3, 32)
    name: string;

    @IsOptional()
    @IsEnum(Language)
    language: Language = Language.DE;
}
