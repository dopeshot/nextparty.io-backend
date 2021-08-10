import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/user/entities/user.entity';
import { UserService } from '../user/user.service'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
    constructor( private readonly userService: UserService) {}
    
    async registerUser(credentials: RegisterDto): Promise<UserDocument> {  
        //While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself  
        const result = await this.userService.create(credentials)
        return result
    }
    
}
