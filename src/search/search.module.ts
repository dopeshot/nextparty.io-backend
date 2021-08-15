import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from 'src/task/entities/task.entity';
import { TaskModule } from 'src/task/task.module';
import { SetSchema } from 'src/set/entities/set.entity';
import { UserSchema } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]),
  MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]), TaskModule,
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), UserModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule { }
