import { OmitType, PickType } from '@nestjs/mapped-types';
import { Expose, Transform, Type } from 'class-transformer';
import { SetDocument, SetDocumentWithUser } from '../entities/set.entity';
import { TaskDocument } from '../entities/task.entity';
import { SetCategory } from '../enums/setcategory.enum';
import { Visibility } from '../enums/visibility.enum';

export class UserPopulate {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    username: string;
}

export class TaskResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    currentPlayerGender: string;
    @Expose()
    type: string;
    @Expose()
    message: string;

    constructor(partial: Partial<TaskDocument>) {
        Object.assign(this, partial);
    }
}

export class SetResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    dareCount: number;
    @Expose()
    truthCount: number;
    @Type(() => UserPopulate)
    @Expose()
    createdBy: UserPopulate;
    @Expose()
    language: string;
    @Expose()
    name: string;
    @Expose()
    category: SetCategory;
    @Expose()
    played: number;

    constructor(partial: Partial<SetDocumentWithUser>) {
        Object.assign(this, partial);
    }
}

export class UpdatedCounts extends PickType(SetResponse, [
    '_id',
    'truthCount',
    'dareCount'
] as const) {
    // Unfortunately inheriting constructers won't be added in the foreseeable future which leads to duplicate code
    // https://github.com/nestjs/swagger/issues/1568#issuecomment-927574767
    constructor(partial: Partial<SetDocument>) {
        super();
        Object.assign(this, partial);
    }
}

export class UpdatedPlayed {
    @Expose()
    played: number;

    // Could be solved like above but since it is only one param it is easier to define it by iself entirely
    constructor(partial: Partial<SetDocument>) {
        Object.assign(this, partial);
    }
}

export class SetMetadataResponse extends OmitType(SetResponse, ['createdBy']) {
    @Expose()
    visibility: Visibility;

    @Expose()
    @Transform((params) => params.obj.createdBy._id.toString())
    createdBy: string;

    constructor(partial: Partial<SetDocument>) {
        super();
        Object.assign(this, partial);
    }
}

export class SetWithTasksResponse extends SetResponse {
    @Expose()
    @Type(() => TaskResponse)
    tasks: TaskResponse[];
}
