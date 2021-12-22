import { Schema } from 'mongoose';

export class MailVerifyJWTDto {
    mail: string;

    name: string;

    id: Schema.Types.ObjectId;
}
