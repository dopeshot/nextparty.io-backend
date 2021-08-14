import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../user/enums/role.enum';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

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

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.reportService.findOneById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: ObjectId) {
    return this.reportService.remove(id);
  }
}
