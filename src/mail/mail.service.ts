import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render} from 'ejs'
import { readFile as _readFile} from 'fs';
import { promisify } from 'util';

const readFile = promisify(_readFile);

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Method that communicates with mailserver to send mail
   * @param recipient - mail adress of receiver
   * @param subject - subject of email
   * @param message - message body of the email
   */
  public sendMail(recipient: string, subject: string, message:string): void {
    this.mailerService
    .sendMail({
        to: recipient,
        from: 'watson.schulist@ethereal.email',
        subject: subject,
        html: message,
      })
      .then(() => {})
      .catch((err) => {console.log(err)});
  }
  
  /**
   * Method called by the test endpoint
   * @param recipient - receiver for the email to be send
   */
  async  mailTest(recipient: string){
    const tmpl =   await readFile(__dirname + '/templates/test.ejs', 'utf-8')
    const message = render(tmpl, { 
        // Data to be sent to template engine.
        code: 'cf1a3f828287',
        username: 'john doe',
     });
    this.sendMail(recipient, "test3", message)
  }
}