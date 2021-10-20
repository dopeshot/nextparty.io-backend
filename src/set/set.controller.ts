import { Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { MongoIdDto } from '../shared/dto/mongoId.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetService } from './set.service';

@ApiTags('set')
@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new set'})
  create(@Body(new ValidationPipe({ whitelist: true })) createSetDto: CreateSetDto, @Request() req) {
    return this.setService.create(createSetDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Sets'})
  findAll(@Query(new ValidationPipe({ whitelist: true })) paginationDto: PaginationDto) {
    return this.setService.findAll(+paginationDto.page, +paginationDto.limit);
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get one Set by id'})
  findOne(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto) {
    return this.setService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // TODO MC: Can not reprocude error
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete Set by id'})
  remove(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto, @Query('type') type: string, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.remove(id, type, user)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update Set by id'}) 
  updateMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.updateMetadata(id, updateSetDto, user);
  }

  //REWORK=====================================================================================
  @Post(':id/task')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Task to Set via id and Json'})
  createTask(@Param('id') id: ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.createTask(id, updateSetTasksDto, user);
  }
  
  //REWORK=====================================================================================
  @Delete(':id/task/:taskid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove one Task via id'})
  removeTask(@Param('id') id:  ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.removeTask(id, updateSetTasksDto, user);
  }

  //REWORK=====================================================================================
  @Patch(':id/task/:taskid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update one Task via id and Json'})
  updateTask(@Param('id') id:  ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.updateTask(id, updateSetTasksDto, user);
  }
}
