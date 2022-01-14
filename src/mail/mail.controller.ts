import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ENVGuard } from '../shared/guards/environment.guard';
import { MailService } from './mail.service';
import { MailTestDto } from './types/mail-test.type';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post()
    @ApiOperation({
        summary: '(Testing only) Send mail to recipient',
        tags: ['testing']
    })
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
