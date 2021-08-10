import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongoose';
import { User } from './entities/user.entity';

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
