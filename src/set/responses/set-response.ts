import { OmitType, PickType } from '@nestjs/mapped-types';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Language } from '../../shared/enums/language.enum';
import { SetDocument, SetDocumentWithUser } from '../entities/set.entity';
import { TaskDocument } from '../entities/task.entity';
import { CurrentPlayerGender } from '../enums/currentplayergender.enum';
import { SetCategory } from '../enums/setcategory.enum';
import { TaskType } from '../enums/tasktype.enum';
import { Visibility } from '../enums/visibility.enum';

export class UserPopulate {
    @Expose()
    @ApiResponseProperty()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    @ApiResponseProperty()
    username: string;
}

export class TaskResponse {
    @Expose()
    @ApiResponseProperty()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    @ApiResponseProperty({ enum: CurrentPlayerGender })
    currentPlayerGender: CurrentPlayerGender;
    @Expose()
    @ApiResponseProperty({ enum: TaskType })
    type: TaskType;
    @Expose()
    @ApiResponseProperty()
    message: string;
    @Expose()
    @ApiResponseProperty()
    slug: string;

    constructor(partial: Partial<TaskDocument>) {
        Object.assign(this, partial);
    }
}
export class SetResponse {
    @Expose()
    @ApiResponseProperty()
    @Transform((params) => params.obj._id.toString())
    _id: string;
    @Expose()
    @ApiResponseProperty()
    dareCount: number;
    @Expose()
    @ApiResponseProperty()
    truthCount: number;
    @Type(() => UserPopulate)
    @Expose()
    @ApiResponseProperty({ type: UserPopulate })
    createdBy: UserPopulate;
    @Expose()
    @ApiResponseProperty({ enum: Language })
    language: Language;
    @Expose()
    @ApiResponseProperty()
    name: string;
    @Expose()
    @ApiResponseProperty({ enum: SetCategory })
    category: SetCategory;
    @Expose()
    @ApiResponseProperty()
    played: number;
    @Expose()
    @ApiResponseProperty({ enum: Visibility })
    visibility: Visibility;
    @Expose()
    @ApiResponseProperty()
    slug: string;

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
    @ApiResponseProperty()
    played: number;

    // Could be solved like above but since it is only one param it is easier to define it by iself entirely
    constructor(partial: Partial<SetDocument>) {
        Object.assign(this, partial);
    }
}

export class SetMetadataResponse extends OmitType(SetResponse, ['createdBy']) {
    @Expose()
    @ApiResponseProperty()
    @Transform((params) => params.obj.createdBy._id.toString())
    createdBy: string;

    constructor(partial: Partial<SetDocument>) {
        super();
        Object.assign(this, partial);
    }
}

export class SetWithTasksResponse extends SetResponse {
    @Expose()
    @ApiResponseProperty({ type: [TaskResponse] })
    @Type(() => TaskResponse)
    tasks: TaskResponse[];
}
