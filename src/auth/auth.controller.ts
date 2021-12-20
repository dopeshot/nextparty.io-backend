import {
    Post,
    Controller,
    Body,
    ValidationPipe,
    Request,
    UseGuards,
    Get,
    HttpCode
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategies/local/local-auth.guard';
import { User } from '../user/entities/user.entity';
import { GoogleAuthGuard } from './strategies/google/google-auth.guard';
import { FacebookAuthGuard } from './strategies/facebook/facebook-auth.guard';
import { DiscordAuthGuard } from './strategies/discord/discord-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenDto } from './dto/jwt.dto';
import { returnUser } from '../user/dto/return-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(
        @Body(ValidationPipe) credentials: RegisterDto
    ): Promise<AccessTokenDto> {
        return await this.authService.registerUser(credentials);
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<AccessTokenDto> {
        return await this.authService.createLoginPayload(req.user);
    }

    @Get('/google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<void> {
        // initiates the Google OAuth2 login flow (see guard)
    }

    @Get('/google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }

    @Get('/facebook')
    @UseGuards(FacebookAuthGuard)
    @HttpCode(200)
    async facebookLogin(): Promise<void> {
        // initiates the Facebook OAuth2 login flow (see guard)
    }

    @Get('/facebook/redirect')
    @UseGuards(FacebookAuthGuard)
    @HttpCode(200)
    async facebookLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }

    @Get('/discord')
    @UseGuards(DiscordAuthGuard)
    @HttpCode(200)
    async discordLogin(): Promise<void> {
        // initiates the Discord OAuth2 login flow (see guard)
    }

    @Get('/discord/redirect')
    @UseGuards(DiscordAuthGuard)
    @HttpCode(200)
    async discordLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }
}
