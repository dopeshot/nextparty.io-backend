import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTVerifyStrategy } from './guards/mailVerify-jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('VERIFY_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('VERIFY_JWT_EXPIRESIN')
                }
            }),
            inject: [ConfigService]
        })
    ],
    controllers: [UserController],
    providers: [UserService, MailService, JWTVerifyStrategy],
    exports: [UserService]
})
export class UserModule {}
