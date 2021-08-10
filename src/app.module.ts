import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { SetModule } from './set/set.module';
import { CategoryModule } from './category/category.module';
import { SearchModule } from './search/search.module';
import { ReportModule } from './report/report.module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [AuthModule, UserModule, TaskModule, SetModule, CategoryModule, SearchModule, ReportModule, SystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
