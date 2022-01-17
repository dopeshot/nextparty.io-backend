import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { ResetRequestDto } from './dto/reset-request.dto';
import { ResetDTo } from './dto/reset.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { VerifyJWTGuard } from './guards/verify/mail-verify-jwt.guard';
import { UserResponse } from './responses/user-response';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiOperation({ summary: 'Get all Users' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllSets(): Promise<UserResponse[]> {
        return (await this.userService.findAll()).map(
            (set) => new UserResponse(set)
        );
    }

    @Get('/verify-account')
    @ApiOperation({ summary: 'Verify user mail adress with JWT' })
    @UseGuards(VerifyJWTGuard)
    async verifyMail(@Request() req): Promise<void> {
        await this.userService.verifyMail(req.user);
    }

    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<UserResponse> {
        return new UserResponse(
            await this.userService.findOneById(req.user.userId)
        );
    }

    @Get('/resend-account-verification')
    @ApiOperation({ summary: 'Rerequest verify email' })
    @UseGuards(JwtAuthGuard)
    async regenerateVerify(@Request() req): Promise<void> {
        const userData = await this.userService.findOneById(req.user.userId);
        await this.userService.createVerification(userData);
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update User' })
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: ObjectId,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<UserResponse> {
        const user = await this.userService.updateUser(
            id,
            updateUserDto,
            req.user
        );
        return new UserResponse(user);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete User' })
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<void> {
        await this.userService.remove(id, req.user);
    }

    @Post('/request-password-reset')
    @ApiOperation({ summary: 'Request password reset mail' })
    async requestReset(@Body() resetRequest: ResetRequestDto) {
        await this.userService.requestReset(resetRequest.mail);
    }

    @Post('/reset-password')
    @ApiOperation({ summary: 'Verify user mail adress with JWT' })
    async resetPassword(@Body() reset: ResetDTo): Promise<UserResponse> {
        const user = this.userService.validateResetToken(reset.token);
        return new UserResponse(
            await this.userService.setPassword((await user)._id, reset.password)
        );
    }
}
