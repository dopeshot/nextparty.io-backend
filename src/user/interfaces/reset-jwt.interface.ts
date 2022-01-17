import { Schema } from 'mongoose';

export class PwResetJWTDto {
    mail: string;

    name: string;

    id: Schema.Types.ObjectId;
}
