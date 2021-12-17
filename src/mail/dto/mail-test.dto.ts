import { IsString} from 'class-validator'

export class MailTestDto {
    @IsString()
    data: string
}