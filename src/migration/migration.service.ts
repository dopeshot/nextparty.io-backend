import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { SetDocument } from '../set/entities/set.entity';
import { Task } from '../set/entities/task.entity';
import { SetService } from '../set/set.service';
import { UserDocument } from '../user/entities/user.entity';
import { Role } from '../user/enums/role.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class MigrationService {
    constructor(
        @InjectModel(Set.name) private setModel: Model<SetDocument>,
        @InjectModel(Task.name) private userModel: Model<UserDocument>,
        private readonly setService: SetService,
        private readonly userService: UserService
    ) {}

    async import(user: JwtUserDto) {
        // MigrateSets.forEach(async (setData) => {
        //     const set: SetDocument = await this.setService.createSet(
        //         {
        //             name: setData.name,
        //             language: setData.language,
        //             category: setData.category,
        //             visibility: setData.visibility
        //         },
        //         user
        //     );
        //     setData.tasks.forEach(async (task) => {
        //         await this.setService.createTask(
        //             set._id,
        //             {
        //                 type: task.type,
        //                 currentPlayerGender: task.currentPlayerGender,
        //                 message: task.message
        //             },
        //             user
        //         );
        //     });
        // });
        return;
    }

    async export(user) {
        if (user.role !== Role.ADMIN) {
            throw ForbiddenException;
        }
        const sets = await this.setModel.find().lean();
        const users = await this.userModel.find().lean();
        return JSON.stringify({ sets: sets, users: users });
    }
}
