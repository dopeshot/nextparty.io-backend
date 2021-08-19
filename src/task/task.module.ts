import { forwardRef, Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema } from './entities/task.entity'
import { SetModule } from '../set/set.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]), forwardRef(()=> SetModule)],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
