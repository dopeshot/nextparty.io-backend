import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['email'] as const)
) {
    @IsEmpty()
    slug?: string;
}

/**
 *
 * In combination with whitelist: true (in controller.ts) this will create the following DTO
 *
 * username
 * password
 *
 * both optional and with the validation "rules" from CreateUserDto
 *
 */
