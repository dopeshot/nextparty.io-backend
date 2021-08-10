import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  tasks: Task[] = [];
  create(createTaskDto: CreateTaskDto) {

    this.tasks.push(this.CreateTaskDtoToTask(createTaskDto));
    return 'This action adds a new task';
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  CreateTaskDtoToTask(createTaskDto: CreateTaskDto): Task { 
    const cacheTask = new Task;
    // TODO: 
    return cacheTask; 
  }
}

