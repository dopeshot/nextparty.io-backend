import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { IdTaskDto } from './id-task.dto';

enum VoteType {
    UPVOTE = "upvote",
    DOWNVOTE = "downvote"
}

export class TaskVoteDto extends PartialType(IdTaskDto) {
    @IsEnum(VoteType)
    vote: VoteType
}

