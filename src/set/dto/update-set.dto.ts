import { PartialType } from '@nestjs/mapped-types';
import { IsEmpty } from 'class-validator';
import { CreateSetDto } from './create-set.dto';

export class UpdateSetDto extends PartialType(CreateSetDto) {
    @IsEmpty()
    slug?: string;
}
