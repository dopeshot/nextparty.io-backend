import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { MongoIdDto } from '../../shared/dto/mongoId.dto';

export enum VoteType {
    UPVOTE = "upvote",
    DOWNVOTE = "downvote"
}

export class TaskVoteDto extends PartialType(MongoIdDto) {
    @IsEnum(VoteType)
    vote: VoteType
}

