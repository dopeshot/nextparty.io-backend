import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ENVGuard } from '../shared/guards/environment.guard';
import { MailService } from './mail.service';
import { MailTestDto } from './types/mail-test.type';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post()
    @UseGuards(ENVGuard)
    async sendMail(@Body('recipient') recipient: string) {
        return await this.mailService.sendMail<MailTestDto>(
            recipient,
            'test',
            { data: 'this is a dummy endpoint' },
            'test'
        );
    }
}
