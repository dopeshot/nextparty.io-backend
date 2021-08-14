import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { IdTaskDto } from './dto/id-task.dto';
import { TaskVoteDto } from './dto/task-vote-dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/paginationDto.dto';

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new task'})
  create(@Body(new ValidationPipe({ whitelist: true, transform: true })) createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks'})
  findAll(@Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.taskService.findAll(+paginationDto.page, +paginationDto.limit);
  }

  // @Get('topten')
  // findTop10Tasks() {
  //   return this.taskService.findTop10Tasks();
  // }
  
  @Get(':id')
  @ApiOperation({ summary: 'Find one task by id'})
  findOne(@Param(ValidationPipe) { id }: IdTaskDto) {
    return this.taskService.findOne(id);
  }

  @Patch(':id/:vote')
  @ApiOperation({ summary: 'Vote one task by id'})
  vote(@Param(ValidationPipe) taskVoteDto: TaskVoteDto,) {
    return this.taskService.vote(taskVoteDto.id, taskVoteDto.vote);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one task by id'})
  update(@Param(ValidationPipe) { id }: IdTaskDto, @Body(new ValidationPipe({whitelist: true})) updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete one task by id'})
  remove(@Param(ValidationPipe) { id }: IdTaskDto, @Query('type') type: string) {
    this.taskService.remove(id, type);
  }
}
