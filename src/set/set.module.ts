import { Module } from '@nestjs/common';
import { SetService } from './set.service';
import { SetController } from './set.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SetSchema } from './entities/set.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }])],
  controllers: [SetController],
  providers: [SetService]
})
export class SetModule {}
