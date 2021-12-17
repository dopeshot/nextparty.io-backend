import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { render } from 'ejs'
import { readFile as _readFile } from 'fs'
import { promisify } from 'util'
import * as nodemailer from 'nodemailer'
import { MailVerifyDto } from './dto/mail-verify.dto'
import { MailPwResetDto } from './dto/mail-pw-reset.dto'
import { MailTestDto } from './dto/mail-test.dto'

const readFile = promisify(_readFile)

@Injectable()
export class MailService {
    mailTransport: nodemailer.Transporter<any>
    maxRetries: number
    errorDelay: number

    constructor() {
        this.mailTransport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_HOST_PORT),
            pool: true,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        })
        this.maxRetries = parseInt(process.env.MAX_MAIL_RETRIES)
        this.errorDelay = parseInt(process.env.MAIL_ERROR_DELAY)
    }

    
    private async  passToMailserver(recipient: string, subject: string, message: string): Promise<void> {

        // Sleep helper func
        const delay = ms => new Promise(res => setTimeout(res, ms));

		let attempts = 0
		while (attempts < this.maxRetries){
			let err
			try {
				await this.mailTransport.sendMail({
					to: recipient,
					from: process.env.MAIL_ADRESS,
					subject: subject,
					html: message,
				})
			}	
			// catch error 	
			catch (e){
				err = e
			} 
			// if error has occured continue loop, else return
			finally {
				if (!err){
					return
				}
				else{
					err = null
					attempts += 1
                    delay(this.errorDelay)
				}
			}
		}
		// getting here means sending the mail is not possible => throw an error
		throw new ServiceUnavailableException("Unable to connect to mailserver")
	}

    async sendMail(recipient: string, template: string, mailData: (MailVerifyDto | MailPwResetDto | MailTestDto), subject: string ): Promise<void>{
        const mailTemplate = await readFile(__dirname + '/templates/' + template + '.ejs', 'utf-8')
        const mailContent = render(mailTemplate, mailData as any)
        await this.passToMailserver(recipient, subject, mailContent)
    } 
}
