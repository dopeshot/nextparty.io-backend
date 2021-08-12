import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /*  Use this for testing
  @Post()
  async sendMail(@Body('recipient') recipient: string) {
    return await this.mailService.mailTest(recipient);
  }
  */

}
