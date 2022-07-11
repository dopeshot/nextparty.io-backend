import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { MigrationModule } from './migration/migration.module';
import { SetModule } from './set/set.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        //this has to be done to ensure that env variables work
        ConfigModule.forRoot({
            envFilePath: ['.env', '.development.env']
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('DB_URI'),
                user: configService.get<string>('DB_USER'),
                pass: configService.get<string>('DB_PASS')
            }),
            inject: [ConfigService]
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ttl: config.get<number>('THROTTLE_TTL'),
                limit: config.get<number>('THROTTLE_LIMIT')
            })
        }),
        MigrationModule,
        MailModule,
        AuthModule,
        UserModule,
        SetModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ]
})
export class AppModule {}
