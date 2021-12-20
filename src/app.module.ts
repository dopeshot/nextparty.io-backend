import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { SetModule } from './set/set.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailModule } from './mail/mail.module'

@Module({
    imports: [
        //this has to be done to ensure that env variables work
        ConfigModule.forRoot({
            envFilePath: ['.env', '.development.env'],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('DB_URI'),
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UserModule,
        SetModule,
        //SystemModule,
        MailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
