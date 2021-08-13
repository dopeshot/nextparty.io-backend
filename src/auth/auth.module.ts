import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { GoogleStrategy } from './strategies/google/google.strategy';
import { FacebookStrategy } from './strategies/facebook/facebook.strategy';
import { DiscordStrategy } from './strategies/discord/discord.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, FacebookStrategy, DiscordStrategy],
  imports: [UserModule, PassportModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { 
        expiresIn: configService.get<string>('JWT_EXPIRESIN')
      }
    }),
    inject: [ConfigService]
  })]
})
export class AuthModule {}
