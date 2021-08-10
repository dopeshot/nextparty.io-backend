import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(ValidationPipe) credentials: CreateUserDto): Promise<any> {
    return await this.userService.create(credentials);
  }

  @Get()
  async findAll(): Promise<any> {
    return await this.userService.findAll();
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(+id, updateUserDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: Types.ObjectId): Promise<any> {
    return await this.userService.remove(id);
  }
}
