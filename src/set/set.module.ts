import { Module } from '@nestjs/common';
import { SetService } from './set.service';
import { SetController } from './set.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SetSchema } from './entities/set.entity'
import { TaskSchema } from '../task/entities/task.entity';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]), 
  MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }])],
  controllers: [SetController],
  providers: [SetService],
  exports: [SetService]
})
export class SetModule {}
