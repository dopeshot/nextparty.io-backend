import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common'
import { Roles } from '../auth/roles/roles.decorator'
import { RolesGuard } from '../auth/roles/roles.guard'
import { Role } from '../user/enums/role.enum'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { CreateReportDto } from './dto/create-report.dto'
import { ReportService } from './report.service'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteType } from './enums/delete-type'
import { PaginationDto } from '../shared/dto/pagination.dto'
import { MongoIdDto } from '../shared/dto/mongoId.dto'

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a report'})
  @ApiBearerAuth()
  create(
    @Body() createReportDto: CreateReportDto, 
    @Request() req) {
    return this.reportService.create(createReportDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all reports'})
  @ApiBearerAuth()
  findAll(
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto ) {
    return this.reportService.findAll(+paginationDto.page, +paginationDto.limit);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get report via id'})
  @ApiBearerAuth()
  findOneById(
    @Param(ValidationPipe) { id }: MongoIdDto) {
    return this.reportService.findOneById(id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete report via id'})
  @ApiBearerAuth()
  remove(
    @Param(ValidationPipe) { id }: MongoIdDto, 
    @Query('type') type: DeleteType, 
    @Request() req) {
    return this.reportService.remove(id, type, req.user);
  }
}
