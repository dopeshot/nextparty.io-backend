import { IsArray } from 'class-validator';

export class MigrationDto {
    @IsArray()
    sets: any[];

    @IsArray()
    users: any[];
}
