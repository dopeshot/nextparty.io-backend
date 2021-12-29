import { ObjectId } from 'mongoose';
import { Status } from '../../shared/enums/status.enum';
import { SetCategory } from '../enums/setcategory.enum';
import { Visibility } from '../enums/visibility.enum';

export type ResponseSet = {
    _id: ObjectId;
    dareCount: number;
    truthCount: number;
    createdBy: {
        _id: ObjectId;
        username: string;
    };
    language: string;
    name: string;
    category: SetCategory;
    played: number;
};

export type ResponseTask = {
    currentPlayerGender: string;
    _id: ObjectId;
    type: string;
    message: string;
};

export type ResponseSetMetadata = {
    _id: ObjectId;
    dareCount: number;
    truthCount: number;
    createdBy: ObjectId;
    language: string;
    category: SetCategory;
    played: number;
    name: string;
    visibility: Visibility;
};

export type UpdatedCounts = {
    _id: ObjectId;
    truthCount: number;
    dareCount: number;
};

export type UpdatedPlayed = {
    played: number;
};

export type ResponseSetWithTasks = ResponseSet & { tasks: ResponseTask[] };

// Only for Backend
export type ResponseTaskWithStatus = ResponseTask & { status: Status };
