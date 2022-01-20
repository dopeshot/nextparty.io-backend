import {
    Body,
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
import { ENVGuard } from '../shared/guards/environment.guard';
import { MigrationDto } from './dto/migration.dto';
import { MigrationService } from './migration.service';

@ApiTags('migration')
@Controller('migrations')
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) {}

    @Post('importsamples')
    @UseGuards(ENVGuard, JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create example data sets' })
    /* istanbul ignore next */ // This is development only
    async importSamples(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<void> {
        await this.migrationService.importSamples(user);
    }

    @Post('import')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Import sets and insert non duplicates' })
    async import(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
        @Body() importData: MigrationDto
    ): Promise<{ setDuplicates: number; userDuplicates: number }> {
        return await this.migrationService.import(user, importData);
    }

    @Get('export')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Export all data from database' })
    async export(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<MigrationDto> {
        return await this.migrationService.export(user);
    }
}
