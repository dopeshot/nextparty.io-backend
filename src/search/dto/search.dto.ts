import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsString, Length, ValidateNested } from "class-validator";
import { ObjectId } from "mongoose";

export class SearchDto {
    // For future usage if search via Json (Tags)
}