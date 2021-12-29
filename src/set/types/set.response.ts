import { ObjectId } from 'mongoose';
import { Status } from '../../shared/enums/status.enum';
import { SetCategory } from '../enums/setcategory';

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
    name: string;
};

export type UpdatedCounts = {
    _id: ObjectId;
    truthCount: number;
    dareCount: number;
};
export type ResponseSetWithTasks = ResponseSet & { tasks: ResponseTask[] };

// Only for Backend
export type ResponseTaskWithStatus = ResponseTask & { status: Status };
