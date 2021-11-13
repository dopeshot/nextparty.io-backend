import { ObjectId } from "mongoose";
import { Status } from "../../shared/enums/status.enum";

export type ResponseSet = {
    _id: ObjectId
    daresCount: number
    truthCount: number
    createdBy: {
        _id: ObjectId
        username: string
    }
    language: string
    name: string
    previewImage: string
    bannerImage: string
}

export type ResponseTask = {

    currentPlayerGender: string
    _id: ObjectId
    type: string
    message: string

}

export type ResponseSetMetadata = {
    _id: ObjectId
    daresCount: number
    truthCount: number
    createdBy: ObjectId
    language: string
    name: string
}

export type UpdatedCounts = {
    _id: ObjectId
    truthCount: number
    daresCount: number
}
export type ResponseSetWithTasks = ResponseSet & { tasks: ResponseTask[] }

// Only for Backend
export type ResponseTaskWithStatus = ResponseTask & { status: Status }