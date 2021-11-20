import { ObjectId } from "mongoose";
import { Status } from "../../shared/enums/status.enum";
import { ResponseSet, ResponseSetWithTasks } from "./set.response";

export type AggregationSetWithTasks = ResponseSet & {

    tasks: [{
        status: Status
        currentPlayerGender: string
        _id: ObjectId
        type: string
        message: string
    }]
}