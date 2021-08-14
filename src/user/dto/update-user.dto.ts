import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {}

/**
 * 
 * In combination with whitelist: true (in controller.ts) this will create the following DTO
 *
 * username
 * password
 * 
 * booth optional and with the validation "rules" from CreateUserDto
 * 
 */