import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    readonly page: number = 0

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    readonly limit: number = 5
}