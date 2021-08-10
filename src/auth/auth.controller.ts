import { Post, Controller, Body, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async registerUser(@Body(ValidationPipe) credentials: RegisterDto) {
      return await this.authService.registerUser(credentials);
    }
  
}
