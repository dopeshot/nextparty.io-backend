import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/jwt.dto';
import { RegisterDto } from './dto/register.dto';
import { DiscordAuthGuard } from './strategies/discord/discord-auth.guard';
import { FacebookAuthGuard } from './strategies/facebook/facebook-auth.guard';
import { GoogleAuthGuard } from './strategies/google/google-auth.guard';
import { LocalAuthGuard } from './strategies/local/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(
        @Body() credentials: RegisterDto
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
        // Initiates the Google OAuth2 login flow (see guard)
    }

    @Get('/google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }

    @Get('/facebook')
    @UseGuards(FacebookAuthGuard)
    async facebookLogin(): Promise<void> {
        // Initiates the Facebook OAuth2 login flow (see guard)
    }

    @Get('/facebook/redirect')
    @UseGuards(FacebookAuthGuard)
    async facebookLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }

    @Get('/discord')
    @UseGuards(DiscordAuthGuard)
    async discordLogin(): Promise<void> {
        // Initiates the Discord OAuth2 login flow (see guard)
    }

    @Get('/discord/redirect')
    @UseGuards(DiscordAuthGuard)
    async discordLoginRedirect(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }
}
