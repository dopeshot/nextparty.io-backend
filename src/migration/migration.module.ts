import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SetSchema } from '../set/entities/set.entity';
import { Task, TaskSchema } from '../set/entities/task.entity';
import { SetModule } from '../set/set.module';
import { User, UserSchema } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Set.name, schema: SetSchema }]),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        UserModule,
        SetModule
    ],
    controllers: [MigrationController],
    providers: [MigrationService],
    exports: [MigrationService]
})
export class MigrationModule {}
