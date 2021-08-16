import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // In dev process we can leave this inside
  @Post()
  async sendMail(@Body('recipient') recipient: string) {
    return await this.mailService.mailTest(recipient);
  }
}
