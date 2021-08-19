import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render, renderFile } from 'ejs'
import { readFile as _readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const readFile = promisify(_readFile);

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {
		mailerService
	 }

	/**
	 * Method that communicates with mailserver to send mail
	 * @param recipient - mail adress of receiver
	 * @param subject - subject of email
	 * @param message - message body of the email
	 */
	private async sendMail(recipient: string, subject: string, message: string): Promise<void> {
		try {
			await this.mailerService.sendMail({
				to: recipient,
				from: 'watson.schulist@ethereal.email',
				subject: subject,
				html: message,
			})
		} catch(error) {
			throw new InternalServerErrorException(`Error sending email with subject: ${subject}`)
		}
	}

	/**
	 * Method called by the test endpoint
	 * @param recipient - receiver for the email to be send
	 */
	async mailTest(recipient: string) {
		const template = await readFile(join(__dirname, 'templates', 'test.ejs'), 'utf-8')
		const message = await renderFile('test.ejs', {
			// Data to be sent to template engine.
			code: 'cf1a3f828287',
			username: 'john doe',
		})
		this.sendMail(recipient, "test3", message)
	}

	/**
	 * Generate the verification Mail
	 * @param name - username 
	 * @param mail - user mail
	 * @param code - verification code
	 */
	async generateVerifyMail(name: string, mail: string, code: string){
		const template = await readFile(join(__dirname, 'templates', 'MailVerify.ejs'), 'utf-8')
		const message = render(template, {
			verifyLink: `${process.env.HOST}/api/user/verify/${code}`,
			username: name,
		});
		this.sendMail(mail, "Please verify your email address", message)
	}

	/**
	 * Sends a mail containing a password reset link/code
	 * @param name - username
	 * @param mail - user email
	 * @param resetCode - the code required to reset/change the pw
	 */
	async sendPasswordReset(name: string, mail, resetCode){
		const tmpl = await readFile(__dirname + '/templates/PasswordReset.ejs', 'utf-8')	
		const message = render(tmpl, {
			resetLink: `http://localhost:3000/api/user/reset-form/${resetCode}`,
			username: name,
		});
		this.sendMail(mail, "Reset your pw", message)
	}
}