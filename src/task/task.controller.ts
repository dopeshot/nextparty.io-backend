import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode, UseGuards } from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { MongoIdDto } from '../shared/dto/mongoId.dto'
import { TaskVoteDto } from './dto/task-vote-dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginationDto } from '../shared/dto/pagination.dto'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { RolesGuard } from '../auth/roles/roles.guard'
import { Roles } from '../auth/roles/roles.decorator'
import { Role } from '../user/enums/role.enum'

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body(new ValidationPipe({ whitelist: true, transform: true })) createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  findAll(@Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.taskService.findAll(+paginationDto.page, +paginationDto.limit);
  }

  @Get('topten')
  findTop10Tasks() {
    return this.taskService.findTop10Tasks();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get tasks from user'})
  userTasks(@Param(new ValidationPipe({whitelist:true})){id}: MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto){
    return this.taskService.userTasks(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one task by id' })
  findOne(@Param(ValidationPipe) { id }: MongoIdDto) {
    return this.taskService.findOne(id);
  }

  @Patch(':id/:vote')
  @ApiOperation({ summary: 'Vote one task by id' })
  vote(@Param(ValidationPipe) taskVoteDto: TaskVoteDto,) {
    return this.taskService.vote(taskVoteDto.id, taskVoteDto.vote);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins
  @ApiOperation({ summary: 'Update one task by id' })
  update(@Param(ValidationPipe) { id }: MongoIdDto, @Body(new ValidationPipe({ whitelist: true })) updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  // TODO: Protected Route, can be done if user created this set or admins (Except hard delete. this should only be possible for admins)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete one task by id' })
  remove(@Param(ValidationPipe) { id }: MongoIdDto, @Query('type') type: string) {
    this.taskService.remove(id, type);
  }
}
