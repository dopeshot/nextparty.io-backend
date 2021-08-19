import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateSetDto } from './dto/create-set.dto';
import { ObjectId } from 'mongoose'
import { UpdateSetDto } from './dto/update-set-metadata.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import { SetService } from './set.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { TaskVoteDto } from '../task/dto/task-vote-dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../user/enums/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { MongoIdDto } from '../shared/dto/mongoId.dto';

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
  findAll() {
    return this.setService.findAll();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get sets from user'})
  userSets(@Param(new ValidationPipe({whitelist:true})){id}: MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto){
    return this.setService.userSets(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Set via id'})
  findOne(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto) {
    return this.setService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete Set via id'})
  remove(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto, @Query('type') type: string) {
    this.setService.remove(id, type);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks in set with paging Maxi-Version'})
  getSetTasks(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.setService.getTasks2(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id/tasks1')
  @ApiOperation({ summary: 'Get all tasks in set with paging Max-Version'})
  getSetTasks1(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto,  @Query('page') page: number) {
    return this.setService.getTasks(id, page);
  }

  @Get(':id/tentasks')
  @ApiOperation({ summary: 'Get top 10 tasks in set sorted by difference'})
  getSetTopTenTasks(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto) {
    return this.setService.findTopTenTasks(id);
  }

  @Get(':id/meta')
  @ApiOperation({ summary: 'Get set metadata'})
  getMeta(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.getMetadata(id);
  }

  @Patch(':id/meta')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Update Set metadata'})
  updateMeta(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.updateMetadata(id, updateSetDto);
  }

  @Patch(':id/:vote')
  @ApiOperation({ summary: 'Vote one Set by id'})
  vote(@Param(ValidationPipe) setVoteDto: TaskVoteDto,) {
    return this.setService.vote(setVoteDto.id, setVoteDto.vote);
  }

  @Post(':id/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Add Task to Set via id and Json'})
  addTask(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "add", updateSetTasksDto);
  }
  
  @Post(':id/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins (Except hard delete. this should only be possible for admins)
  @ApiOperation({ summary: 'Remove one Set via id and Json'})
  removeTask(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "remove", updateSetTasksDto);
  }
}
