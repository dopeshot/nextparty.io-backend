import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { render } from 'ejs';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // In dev process we can leave this inside
  @Post()
  async sendMail(@Body('recipient') recipient: string) {
    return await this.mailService.mailTest(recipient);
  }

  // In dev process we can leave this inside
  @Get()
  @Render('index')
  async test(@Body('recipient') recipient: string) {
    return
    //return await this.mailService.mailTest(recipient);
  }
}
