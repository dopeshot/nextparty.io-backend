import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { render} from 'ejs'
import { readFile as _readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const readFile = promisify(_readFile);



@Injectable()
export class MailService {

	mailTransport: nodemailer.Transporter<any>
	
	constructor(private readonly configService: ConfigService) {
		this.mailTransport = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: parseInt(process.env.MAIL_HOST_PORT),
			pool: true,
			secure: false,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS
			}
		  })
	}

	/**
	 * Method that communicates with mailserver to send mail
	 * @param recipient - mail adress of receiver
	 * @param subject - subject of email
	 * @param message - message body of the email
	 */
	private async sendMail(recipient: string, subject: string, message: string): Promise<void> {
		try {
			await this.mailTransport.sendMail({
				to: recipient,
				from: 'watson.schulist@ethereal.email',
				subject: subject,
				html: message,
			})
		} catch(error) {
			throw new InternalServerErrorException(`Error sending email with subject: ${subject} with issue: ${error.message}`)
		}
	}

	/**
	 * Method called by the test endpoint
	 * @param recipient - receiver for the email to be send
	 * @param data - data to be displayed and rendered by ejs
	 */
	async mailTest(recipient: string, data: string): Promise<void> {
		const tmpl = await readFile(__dirname + '/templates/test.ejs', 'utf-8')	
		const message = render(tmpl, {
			data: data
		});
		this.sendMail(recipient, "test", message)
	}

	/**
	 * Generate the verification Mail
	 * @param name - username 
	 * @param mail - user mail
	 * @param code - verification code
	 */
	async generateVerifyMail(name: string, mail: string, code: string): Promise<void>{
		const template = await readFile(join(__dirname, 'templates', 'MailVerify.ejs'), 'utf-8')
		const message = render(template, {
			verifyLink: `${process.env.HOST}/user/verify/${code}`,
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
	async sendPasswordReset(name: string, mail: string, resetCode: string): Promise<void>{
		const tmpl = await readFile(__dirname + '/templates/PasswordReset.ejs', 'utf-8')	
		const message = render(tmpl, {
			resetLink: `${process.env.HOST}/user/reset-form/${resetCode}`,
			username: name,
		});
		this.sendMail(mail, "Reset your pw", message)
	}
}