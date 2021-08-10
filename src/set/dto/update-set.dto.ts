import { PartialType } from '@nestjs/mapped-types';
import { CreateSetDto } from './create-set.dto';

export class UpdateSetDto extends PartialType(CreateSetDto) {}
