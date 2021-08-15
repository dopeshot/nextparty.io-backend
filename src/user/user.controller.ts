import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongoose';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findAll(): Promise<any> {
    return await this.userService.findAll();
  }

  @Get("/verify/:code")
  async verifyMail(@Param('code') code: string): Promise<any> {
    console.log(code)
    return await this.userService.veryfiyUser(code);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req): Promise<any> {
    return req.user
  }

  @Patch('/:id')
  async update(@Param('id') id: ObjectId, @Body(new ValidationPipe({
    // whitelist will strip all fields which are not in the DTO
    whitelist: true
  })) updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: ObjectId): Promise<any> {
    return await this.userService.remove(id);
  }
}
