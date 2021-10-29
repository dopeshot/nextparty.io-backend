import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // This is an endpoint sorely meant to be used for testing purposes. 
  // Disable this once done testing or delete the controller enturely
  @Post()
  async sendMail(@Body('recipient') recipient: string) {
    return await this.mailService.mailTest(recipient, "this is a dummy endpoint");
  }

}
