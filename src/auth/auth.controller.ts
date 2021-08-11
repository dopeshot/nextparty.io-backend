import { Post, Controller, Body, ValidationPipe, Request, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './strategies/local/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(@Body(ValidationPipe) credentials: RegisterDto) {
      return await this.authService.registerUser(credentials);
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req): Promise<any> {
      return await this.authService.createLoginPayload(req.user)
    }
}
