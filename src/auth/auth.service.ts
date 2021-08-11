import { Injectable, InternalServerErrorException, Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcrypt'
import { AccessTokenDto } from './dto/jwt.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}
    
    /**
     * Register User (Creates a new one)
     * @param credentials of the user
     * @returns the new registered User
     */
    async registerUser(credentials: RegisterDto): Promise<User> {  
        //While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself  
        const result = await this.userService.create(credentials)
        return result
    }

    /**
     * Search for a user by username and validate with the password
     * @param username of the user
     * @param password of the user
     * @returns user without password or if user do not exist returns null 
     */
    async validateUserWithUsernamePassword(username: string, password: string): Promise<any> {
        const user = await this.userService.findOneByUsername(username)
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user
            return result
        }
        return null
    }

    /**
     * Creates Login Payload and generate JWT with the payload
     * @param user logged in user
     * @returns access token 
     */
    async createLoginPayload(user: LoginDto): Promise<AccessTokenDto> {
        const payload = { 
            username: user.username,
            sub: user._id
        }

        return {
            access_token: this.jwtService.sign(payload)
        }
    }

    async createOAuthLoginJwt(thirdPartyId: string, provider: any): Promise<AccessTokenDto> {
        try {
            // here register logic to register user in Data pase
            const payload = {
                thirdPartyId,
                provider
            }

            return {
                access_token : this.jwtService.sign(payload)
            } 
        } catch (error) {
            throw new InternalServerErrorException('OAuthLoginPayload', error.message)
        }
    }

    async googleLogin(req): Promise<any> {
        if (!req.user)
            return "No user from Google"
        
        return {
            ...req.user.access_token
        }
    }
}
