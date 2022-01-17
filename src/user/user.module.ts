import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt/jwt.strategy';
import { MailService } from '../mail/mail.service';
import { User, UserSchema } from './entities/user.entity';
import { JWTVerifyStrategy } from './guards/verify/mail-verify-jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
    providers: [
        UserService,
        MailService,
        JWTVerifyStrategy,
        JwtStrategy,
        AuthService
    ],
    exports: [UserService]
})
export class UserModule {}
