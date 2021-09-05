import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";
import { Action } from "../../shared/enums/action.enum";
import { MongoIdDto } from "../../shared/dto/mongoId.dto";

export class addSetIdCategoryDto extends PartialType(MongoIdDto){
    @IsMongoId()
    setId: ObjectId

    @IsEnum(Action)
    action: Action
}
