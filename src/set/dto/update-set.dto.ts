import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { Language } from '../../shared/enums/language.enum';
import { CreateSetDto } from './create-set.dto';

export class UpdateSetDto extends PartialType(
    OmitType(CreateSetDto, ['language'])
) {
    @IsOptional()
    @IsEnum(Language)
    language: Language;
}
