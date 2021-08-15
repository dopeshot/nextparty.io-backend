import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from 'ejs'
import { readFile as _readFile } from 'fs';
import { promisify } from 'util';

const readFile = promisify(_readFile);

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) { }

	/**
	 * Method that communicates with mailserver to send mail
	 * @param recipient - mail adress of receiver
	 * @param subject - subject of email
	 * @param message - message body of the email
	 */
	public async sendMail(recipient: string, subject: string, message: string): Promise<void> {
		try {
			await this.mailerService.sendMail({
				to: recipient,
				from: 'watson.schulist@ethereal.email',
				subject: subject,
				html: message,
			})
		} catch(error) {
			throw new InternalServerErrorException({ message: `Error sending email with subject: ${subject}`})
		}
	}

	/**
	 * Method called by the test endpoint
	 * @param recipient - receiver for the email to be send
	 */
	async mailTest(recipient: string) {
		const tmpl = await readFile(__dirname + '/templates/test.ejs', 'utf-8')
		const message = render(tmpl, {
			// Data to be sent to template engine.
			code: 'cf1a3f828287',
			username: 'john doe',
		});
		this.sendMail(recipient, "test3", message)
	}

	/**
	 * Generate the verification Mail
	 * @param name - username 
	 * @param mail - user mail
	 * @param code - verification code
	 */
	async generateVerifyMail(name: string, mail: string, code: string){
		const message = '<b>Hey, '+name+'<br>Your code is:'+code+'</b>'
		this.sendMail(mail, "Verifiy your Email", message)
	}
}