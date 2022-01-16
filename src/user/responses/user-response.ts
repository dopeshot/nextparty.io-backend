import { Expose, Transform } from 'class-transformer';
import { UserDocument } from '../entities/user.entity';

export class UserResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

    @Expose()
    username: string;

    @Expose()
    role: string;

    @Expose()
    status: string;

    @Expose()
    email: string;

    @Expose()
    slug: string;

    constructor(partial: Partial<UserDocument>) {
        Object.assign(this, partial);
    }
}
