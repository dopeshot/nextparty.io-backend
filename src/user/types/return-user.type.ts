import { User } from '../entities/user.entity';

export type returnUser = Pick<
    User,
    '_id' | 'username' | 'role' | 'status' | 'provider'
>;
