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
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    //this has to be done to ensure that env variables work
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env']
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        useCreateIndex: true,
        useFindAndModify: false
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    TaskModule,
    SetModule,
    CategoryModule,
    SearchModule,
    ReportModule,
    SystemModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
