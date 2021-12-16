import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SetSchema } from '../set/entities/set.entity';
import { UserSchema } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), UserModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule { }
