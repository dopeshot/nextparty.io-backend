import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Language } from '../../shared/enums/language.enum';
import { SetCategory } from '../enums/setcategory.enum';
import { Visibility } from '../enums/visibility.enum';

export class CreateSetDto {
    @IsString()
    @Length(3, 32)
    name: string;

    @IsOptional()
    @IsEnum(Language)
    language: Language;

    @IsEnum(SetCategory)
    category: SetCategory;

    @IsOptional()
    @IsEnum(Visibility)
    visibility: Visibility;
}
