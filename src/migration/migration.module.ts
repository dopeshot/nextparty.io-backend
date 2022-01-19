import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { MailModule } from '../mail/mail.module';
import { SetSchema } from '../set/entities/set.entity';
import { Task, TaskSchema } from '../set/entities/task.entity';
import { SetModule } from '../set/set.module';
import { SetService } from '../set/set.service';
import { User, UserSchema } from '../user/entities/user.entity';
import { JWTVerifyStrategy } from '../user/guards/mail-verify-jwt.strategy';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Set.name, schema: SetSchema }]),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        SetModule,
        AuthModule,
        UserModule,
        MailModule
    ],
    controllers: [MigrationController],
    providers: [
        MigrationService,
        SetService,
        UserService,
        JwtService,
        JWTVerifyStrategy,
        AuthService
    ],
    exports: [MigrationService]
})
export class MigrationModule {}
