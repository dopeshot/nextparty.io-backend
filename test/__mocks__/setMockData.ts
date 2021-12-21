import { CurrentPlayerGender } from '../../src/set/enums/currentplayergender.enum';
import { TaskType } from '../../src/set/enums/tasktype.enum';
import { Language } from '../../src/shared/enums/language.enum';
import { Status } from '../../src/shared/enums/status.enum';

export const getSetSetupData = () => {
    return {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        status: Status.ACTIVE,
        language: Language.EN,
        name: 'User Set',
        createdBy: 'aaaaaaaaaaaaaaaaaaaaaaac',
        previewImage: 'placeholder',
        bannerImage: 'placeHolder2',
        daresCount: 0,
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
    };
};

export const getMockSet = () => {
    return { language: Language.DE, name: 'Set number 0' };
};

export const getMockAuthUser = () => {
    return {
        userId: 'aaaaaaaaaaaaaaaaaaaaaaac',
        username: 'User',
        role: 'user'
    };
};

export const getMockUser = () => {
    return {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaac',
        username: 'User',
        role: 'user',
        email: 'test.test@test.de'
    };
};

export const getMockAuthAdmin = () => {
    return {
        userId: 'aaaaaaaaaaaaaaaaaaaaaaad',
        username: 'Admin',
        role: 'admin'
    };
};
export const getMockAdmin = () => {
    return {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaad',
        username: 'Admin',
        role: 'admin'
    };
};

export const getWrongId = () => {
    return 'aaaaaaaaaaaaaaaaaaaaaaae';
};
export const getMockTask = () => {
    return {
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: 'new long enough Task'
    };
};
export const getString = (length: number) => {
    let string = new Array(length + 1).join('a');
    return string;
};
