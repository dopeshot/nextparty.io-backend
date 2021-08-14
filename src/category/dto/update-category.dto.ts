import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(OmitType(CreateCategoryDto, ['set','author'] as const)) {}
