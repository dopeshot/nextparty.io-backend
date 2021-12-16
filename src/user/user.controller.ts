import { Body, Controller, Delete, Get, Param, Patch, Post, Render, Request, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findAll(): Promise<any> {
    return await this.userService.findAll();
  }

  @Get('/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getVerifyByUsername(@Body() userData: {userId: ObjectId}): Promise<any> {
    return await this.userService.findVerify(userData.userId)
  }

  @Get("/verify/:code")
  @Render("MailVerify")
  async verifyMail(@Param('code') code: string, @Res() res: Response): Promise<any> {
    let result = await this.userService.veryfiyUser(code)
    return 
    
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req): Promise<any> {
    return req.user
  }

  /**
   * FOR TESTING
   * @param id Object Id
   * @param role body
   */
  @Patch('/testing/:id')
  async updateRole(@Param('id') id: ObjectId, @Body() role: Role) {
    return await this.userService.patchRole(id, role)
  }
  
  @Get('/getVerify')
  @UseGuards(JwtAuthGuard)
  async regenerateVerify(@Request() req): Promise<any> {
    return this.userService.createVerification(await this.userService.parseJWTtOUsable(req.user))
  }

  @Patch('/:id')
  async update(@Param('id') id: ObjectId, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: ObjectId): Promise<any> {
    return await this.userService.remove(id);
  }

  @Get('/password-reset')
  async resetPassword(@Body() userData: {userMail: string}){
    return await this.userService.requestResetPassword(userData.userMail)
  }

  @Get('/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getResetByUsername(@Body() userData: {userId: ObjectId}): Promise<any> {
    return await this.userService.findReset(userData.userId)
  }

  @Get('/reset-form/:code')
  @Render('reset')
  async getResetForm(@Param('code') Usercode: string){
    return { code: Usercode , submitURL: `${process.env.HOST}/api/user/submitReset`}
  }
  
  @Post('/submitReset')
  async validateReset(@Body() values: { password: string, code: string }){
    return await this.userService.validatePasswordReset(values.code, values.password)
  }
}
