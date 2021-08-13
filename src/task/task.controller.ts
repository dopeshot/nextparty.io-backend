import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ObjectId } from 'mongoose';
import { IdTaskDto } from './dto/id-task.dto';
import { TaskVoteDto } from './dto/task-vote-dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  create(@Body(new ValidationPipe({ whitelist: true, transform: true })) createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get('topten')
  findTop10Tasks() {
    return this.taskService.findTop10Tasks();
  }
  
  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.taskService.findOne(id);
  }

  

  @Patch(':id/:vote')
  vote(@Param(ValidationPipe) taskVoteDto: TaskVoteDto,) {
    return this.taskService.vote(taskVoteDto.id, taskVoteDto.vote);
  }

  @Patch(':id')
  update(@Param(ValidationPipe) { id }: IdTaskDto, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }


  @HttpCode(204)
  @Delete(':id')
  remove(@Param(ValidationPipe) { id }: IdTaskDto, @Query('type') type: string) {
    this.taskService.remove(id, type);
  }
}
