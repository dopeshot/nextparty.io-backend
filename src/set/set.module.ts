import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../set/entities/task.entity';
import { SetSchema, Set } from './entities/set.entity';
import { SetController } from './set.controller';
import { SetService } from './set.service';

@Module({
    // TODO MC: Does forFeature from Mongoose only import or instance? This could cause bugs..
    imports: [
        MongooseModule.forFeature([{ name: Set.name, schema: SetSchema }]),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])
    ],
    controllers: [SetController],
    providers: [SetService],
    exports: [SetService]
})
export class SetModule {}
