import { CurrentPlayerGender } from '../../src/set/enums/currentplayergender.enum';
import { SetCategory } from '../../src/set/enums/setcategory.enum';
import { TaskType } from '../../src/set/enums/tasktype.enum';
import { Visibility } from '../../src/set/enums/visibility.enum';
import { Language } from '../../src/shared/enums/language.enum';
import { Status } from '../../src/shared/enums/status.enum';
import { Role } from '../../src/user/enums/role.enum';

export const getSetSetupData = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        status: Status.ACTIVE,
        language: Language.DE,
        category: SetCategory.CLASSIC,
        visibility: Visibility.PUBLIC,
        played: 0,
        name: 'User Set1',
        slug: 'user-set1',
        createdBy: 'aaaaaaaaaaaaaaaaaaaaaaac',
        dareCount: 0,
        truthCount: 1,
        tasks: [
            {
                _id: 'aaaaaaaaaaaaaaaaaaaaaaba',
                status: Status.ACTIVE,
                type: TaskType.TRUTH,
                currentPlayerGender: CurrentPlayerGender.ANYONE,
                message: '1234567890',
                slug: '1234567890'
            }
        ]
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
        status: Status.ACTIVE,
        language: Language.EN,
        category: SetCategory.CLASSIC,
        visibility: Visibility.PRIVATE,
        played: 0,
        name: 'User Set2',
        slug: 'user-set2',
        createdBy: 'aaaaaaaaaaaaaaaaaaaaaaac',
        dareCount: 0,
        truthCount: 1,
        tasks: [
            {
                _id: 'aaaaaaaaaaaaaaaaaaaaaaba',
                status: Status.ACTIVE,
                type: TaskType.TRUTH,
                currentPlayerGender: CurrentPlayerGender.ANYONE,
                message: '1234567890',
                slug: '1234567890'
            }
        ]
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaf',
        status: Status.DELETED,
        language: Language.EN,
        category: SetCategory.CLASSIC,
        visibility: Visibility.PRIVATE,
        played: 0,
        name: 'User Set3',
        slug: 'user-set3',
        createdBy: 'aaaaaaaaaaaaaaaaaaaaaaac',
        dareCount: 0,
        truthCount: 1,
        tasks: [
            {
                _id: 'aaaaaaaaaaaaaaaaaaaaaaba',
                status: Status.ACTIVE,
                type: TaskType.TRUTH,
                currentPlayerGender: CurrentPlayerGender.ANYONE,
                message: '1234567890',
                slug: '1234567890'
            }
        ]
    }
];
export const getUserSetupData = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaac',
        status: 'unverified',
        role: 'user',
        password:
            '$2b$12$K9Ss9alRrTtXuroPxI8EOeFFmsP1R1cuX/li//qdDq3Dq/wEKRdt.',
        slug: 'heawdassdllo',
        email: 'teasdawdawst@gmail.de',
        username: 'Heawdassdllo'
    }
];
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

export const getOtherMockAuthUser = () => ({
    userId: 'aaaaaaaaaaaaaaaaaaaaaabb',
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

export const getMockFullSet = () => ({
    name: 'Tornardo',
    language: 'de',
    category: 'classic',
    visibility: 'public',
    tasks: [
        {
            type: 'truth',
            currentPlayerGender: '@ca',
            message: 'wann hattest Du dein erstes Mal?'
        },
        {
            type: 'truth',
            currentPlayerGender: '@cf',
            message: 'hast Du schon einmal einen Schwulen-Porno angeschaut?'
        },
        {
            type: 'truth',
            currentPlayerGender: '@cm',
            message:
                'hattest Du schon etwas mit jemanden aus der Runde? Wenn nein, mit wem könntest Du dir etwas vorstellen?'
        }
    ]
});
