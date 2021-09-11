import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { TaskSchema } from '../task/entities/task.entity';
import { SetSchema } from './entities/set.entity';
import { SetController } from './set.controller';
import { SetService } from './set.service';

@Module({
  // TODO MC: Does forFeature from Mongoose only import or instance? This could cause bugs..
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]), 
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }])
  ],
  controllers: [SetController],
  providers: [SetService],
  exports: [SetService]
})
export class SetModule {}
