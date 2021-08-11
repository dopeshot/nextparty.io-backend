import { Post, Controller, Body, ValidationPipe, Request, UseGuards, Get } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './strategies/local/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { GoogleAuthGuard } from './strategies/google/google-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(@Body(ValidationPipe) credentials: RegisterDto): Promise<User> {
      return await this.authService.registerUser(credentials);
    }
  
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<any> {
      return await this.authService.createLoginPayload(req.user)
    }

    @Get('/google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(@Request() req): Promise<any> {
      // initiates the Google OAuth2 login flow
    }

    @Get('/google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleLoginRedirect(@Request() req): Promise<any> {
      return this.authService.googleLogin(req)
    }
}
