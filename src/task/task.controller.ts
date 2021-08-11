import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ObjectId } from 'mongoose';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body(new ValidationPipe({whitelist: true, transform: true})) createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id:ObjectId) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: ObjectId, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.update(id, createTaskDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: ObjectId) {
  //   return this.taskService.remove(id);
  // }
}
