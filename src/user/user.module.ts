import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { VerifySchema } from './entities/verify.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  MongooseModule.forFeature([{ name: 'Verify', schema: VerifySchema }]),
  MongooseModule.forFeature([{ name: 'Reset', schema: VerifySchema }])],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService] 
})
export class UserModule {}
