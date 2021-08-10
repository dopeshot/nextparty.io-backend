import { Module } from '@nestjs/common';
import { SetService } from './set.service';
import { SetController } from './set.controller';

@Module({
  controllers: [SetController],
  providers: [SetService]
})
export class SetModule {}
