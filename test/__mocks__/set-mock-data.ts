import { CurrentPlayerGender } from '../../src/set/enums/currentplayergender.enum';
import { SetCategory } from '../../src/set/enums/setcategory';
import { TaskType } from '../../src/set/enums/tasktype.enum';
import { Language } from '../../src/shared/enums/language.enum';
import { Status } from '../../src/shared/enums/status.enum';
import { Role } from '../../src/user/enums/role.enum';

export const getSetSetupData = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    status: Status.ACTIVE,
    language: Language.EN,
    category: SetCategory.CLASSIC,
    name: 'User Set',
    createdBy: 'aaaaaaaaaaaaaaaaaaaaaaac',
    dareCount: 0,
    truthCount: 1,
    tasks: [
        {
            _id: 'aaaaaaaaaaaaaaaaaaaaaaba',
            status: Status.ACTIVE,
            type: TaskType.TRUTH,
            currentPlayerGender: CurrentPlayerGender.ANYONE,
            message: '1234567890'
        }
    ]
});
export const getMockSet = () => ({
    language: Language.DE,
    name: 'Set number 0',
    category: SetCategory.CLASSIC
});

export const getMockAuthUser = () => ({
    userId: 'aaaaaaaaaaaaaaaaaaaaaaac',
    username: 'User',
    role: Role.USER
});

export const getMockAuthAdmin = () => ({
    userId: 'aaaaaaaaaaaaaaaaaaaaaaad',
    username: 'Admin',
    role: Role.ADMIN
});

export const getWrongId = () => 'aaaaaaaaaaaaaaaaaaaaaaae';

export const getMockTask = () => ({
    type: TaskType.TRUTH,
    currentPlayerGender: CurrentPlayerGender.ANYONE,
    message: 'new long enough Task'
});

export const getString = (length: number) => new Array(length + 1).join('a');
