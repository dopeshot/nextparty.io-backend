import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SetModule } from './set/set.module';
import { SearchModule } from './search/search.module';
import { ReportModule } from './report/report.module';
import { SystemModule } from './system/system.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { SharedModule } from './shared/shared.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    //this has to be done to ensure that env variables work
    ConfigModule.forRoot({
      envFilePath: ['.env', '.development.env']
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI')
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    SetModule,
    SearchModule,
    ReportModule,
    SystemModule,
    MailModule,
    SharedModule,
    ImageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
