import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { MigrationService } from './migration.service';

@ApiTags('migration')
@Controller('migrations')
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) {}

    @Post('import')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create example data sets' })
    async import(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<void> {
        await this.migrationService.import(user);
    }

    @Get('export')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Export all data from database' })
    async export(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<string> {
        return await this.migrationService.export(user);
    }
}
