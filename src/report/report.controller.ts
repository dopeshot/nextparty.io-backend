import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common'
import { ObjectId } from 'mongoose'
import { Roles } from '../auth/roles/roles.decorator'
import { RolesGuard } from '../auth/roles/roles.guard'
import { Role } from '../user/enums/role.enum'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { CreateReportDto } from './dto/create-report.dto'
import { ReportService } from './report.service'
import { ApiTags } from '@nestjs/swagger';
import { DeleteType } from './enums/delete-type'

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportService.create(createReportDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findAll() {
    return this.reportService.findAll();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findOneById(@Param('id') id: ObjectId) {
    return this.reportService.findOneById(id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(204)
  remove(@Param('id') id: ObjectId, @Query('type') type: DeleteType, @Request() req) {
    return this.reportService.remove(id, type, req.user);
  }
}
