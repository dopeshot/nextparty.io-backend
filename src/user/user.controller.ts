import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Render,
    Request,
    UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ObjectId } from 'mongoose'
import { Roles } from '../auth/roles/roles.decorator'
import { RolesGuard } from '../auth/roles/roles.guard'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { ENVGuard} from '../shared/guards/environment.guard'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { Role } from './enums/role.enum'
import { VerifyJWTGuard } from './guards/mailVerify-jwt.guard'
import { UserService } from './user.service'

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async findAll(): Promise<User[]> {
        return await this.userService.findAll()
    }

    @Get('/verify')
    @UseGuards(VerifyJWTGuard)
    @Render('MailVerify')
    async verifyMail(@Request() req): Promise<User> {
        return await this.userService.veryfiyUser(req.user)
    }

    @Get('/profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req): Promise<User> {
        return req.user
    }

    @Patch('/testing/:id')
    @UseGuards(ENVGuard)
    async updateRole(@Param('id') id: ObjectId, @Body() role: Role): Promise<User> {
        return await this.userService.patchRole(id, role)
    }

    @Get('/getVerify')
    @UseGuards(JwtAuthGuard)
    async regenerateVerify(@Request() req): Promise<void> {
        return this.userService.createVerification(
            await this.userService.parseJWTtOUsable(req.user),
        )
    }

    

    

    @Patch('/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async update(
        @Param('id') id: ObjectId,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return await this.userService.updateUser(id, updateUserDto)
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<User> {
        return await this.userService.remove(id, req.user)
    }
}
