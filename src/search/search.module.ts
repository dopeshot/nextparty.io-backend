import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from '../set/entities/task.entity';
import { SetSchema } from '../set/entities/set.entity';
import { UserSchema } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), UserModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule { }
