import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/jwt.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './strategies/google/google-auth.guard';
import { LocalAuthGuard } from './strategies/local/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    async registerUser(
        @Body() credentials: RegisterDto
    ): Promise<AccessTokenDto> {
        return await this.authService.registerUser(credentials);
    }

    @Post('login')
    @ApiOperation({ summary: 'User login with mail and password' })
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<AccessTokenDto> {
        return await this.authService.createLoginPayload(req.user);
    }

    @Post('/google')
    @ApiOperation({ summary: 'Handle user data provided by google' })
    @UseGuards(GoogleAuthGuard)
    googleLogin(@Request() req): Promise<AccessTokenDto> {
        return this.authService.handleProviderLogin(req.user);
    }
}
