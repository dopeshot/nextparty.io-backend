import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateSetDto } from './dto/create-set.dto';
import { ObjectId } from 'mongoose'
import { UpdateSetDto } from './dto/update-set-metadata.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import { SetService } from './set.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { TaskVoteDto } from '../task/dto/task-vote-dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Role } from 'src/user/enums/role.enum';
import { Roles } from 'src/auth/roles/roles.decorator';

@ApiTags('set')
@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new Set via Json'})
  create(@Body() createSetDto: CreateSetDto) {
    return this.setService.create(createSetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Sets'})
  findAll() {
    return this.setService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Set via id'})
  findOne(@Param('id') id: ObjectId) {
    return this.setService.findOne(id);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Delete Set via id'})
  remove(@Param('id') id: ObjectId, @Query('type') type: string) {
    this.setService.remove(id, type);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks in set with paging Maxi-Version'})
  getSetTasks(@Param('id') id:  ObjectId,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.setService.getTasks2(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id/tasks1')
  @ApiOperation({ summary: 'Get all tasks in set with paging Max-Version'})
  getSetTasks1(@Param('id') id:  ObjectId,  @Query('page') page: number) {
    return this.setService.getTasks(id, page);
  }

  @Get(':id/tentasks')
  @ApiOperation({ summary: 'Get top 10 tasks in set sorted by difference'})
  getSetTopTenTasks(@Param('id') id:  ObjectId) {
    return this.setService.findTopTenTasks(id);
  }

  @Get(':id/meta')
  @ApiOperation({ summary: 'Get set metadata'})
  getMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.getMetadata(id);
  }

  @Patch(':id/meta')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Update Set metadata'})
  updateMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.updateMetadata(id, updateSetDto);
  }

  @Patch(':id/:vote')
  @ApiOperation({ summary: 'Vote one Set by id'})
  vote(@Param(ValidationPipe) setVoteDto: TaskVoteDto,) {
    return this.setService.vote(setVoteDto.id, setVoteDto.vote);
  }

  @Post(':id/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Add Task to Set via id and Json'})
  addTask(@Param('id') id: ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "add", updateSetTasksDto);
  }
  
  @Post(':id/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Remove one Set via id and Json'})
  removeTask(@Param('id') id:  ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "remove", updateSetTasksDto);
  }
}
