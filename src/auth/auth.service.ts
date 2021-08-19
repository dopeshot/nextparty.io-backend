import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcrypt'
import { AccessTokenDto } from './dto/jwt.dto'
import { userDataFromProvider } from '../user/interfaces/userDataFromProvider.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    /**
     * Register User (Creates a new one)
     * @param credentials of the user
     * @returns the new registered User
     */
    async registerUser(credentials: RegisterDto): Promise<any> {
        //While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself  
        const user: User = await this.userService.create(credentials)

        if (!user)
            new BadRequestException()

        return this.createLoginPayload(user)
    }

    /**
     * Search for a user by username and validate with the password
     * @param username of the user
     * @param password of the user
     * @returns user without password or if user do not exist returns null 
     */
    async validateUserWithEmailPassword(email: string, password: string): Promise<any> {
        const user = await this.userService.findOneByEmail(email)
        if (!user)
            throw new BadRequestException(`There is no user with the email: ${email}`)

        if (user.provider)
            throw new UnauthorizedException(`User can't login with Username and Password, already has account on ${user.provider}`)

        if (await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user
            return result
        }
        return null
    }

    async handleProviderLogin(userDataFromProvider: userDataFromProvider): Promise<any> {
        if (!userDataFromProvider)
            throw new InternalServerErrorException('Request does not have a user. Please contact the administrator')

        // Check if user already exits
        const alreadyCreatedUser = await this.userService.findOneByEmail(userDataFromProvider.email)

        // Check if provider is the same
        if (alreadyCreatedUser && alreadyCreatedUser.provider !== userDataFromProvider.provider)
            throw new ForbiddenException(`This email is already registered with ${alreadyCreatedUser.provider ? alreadyCreatedUser.provider : 'Email and Password Auth'}`)

        if (alreadyCreatedUser)
            return this.createLoginPayload(alreadyCreatedUser)

        // Create User
        const newUser: User = await this.userService.createUserFromProvider(userDataFromProvider)

        // Create Payload and JWT
        return this.createLoginPayload(newUser)
    }

    /**
     * Creates Login Payload and generate JWT with the payload
     * @param user logged in user
     * @returns access token 
     */
    async createLoginPayload(user: User): Promise<AccessTokenDto> {
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role
        }

        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
