import { ObjectId } from "mongoose";

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
}

export type ResponseTask = {

    currentPlayerGender: string
    _id: ObjectId
    type: string
    message: string

}

export type ResponseSetWithTasks = ResponseSet & { tasks: ResponseTask[] }

export type ResponseUpdatedSet = {
    _id: ObjectId
    daresCount: number
    truthCount: number
    createdBy: ObjectId
    language: string
    name: string
}