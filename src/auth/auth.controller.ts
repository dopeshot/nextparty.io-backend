import { Post, Controller, Body, ValidationPipe, Request, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './strategies/local/local-auth.guard';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(@Body(ValidationPipe) credentials: RegisterDto): Promise<User> {
      return await this.authService.registerUser(credentials);
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req): Promise<any> {
      return await this.authService.createLoginPayload(req.user)
    }
}
