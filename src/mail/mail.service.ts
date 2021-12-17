import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common'
import { render } from 'ejs'
import { access, readFile as _readFile } from 'fs'
import { promisify } from 'util'
import { dirname } from 'path'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import {
    delay,
    retryWhen,
    tap,
    scan,
} from 'rxjs/operators'
import { MailVerifyDto } from './dto/mail-verify.dto'
import { MailPwResetDto } from './dto/mail-pw-reset.dto'

const readFile = promisify(_readFile)

@Injectable()
export class MailService {
    mailTransport: nodemailer.Transporter<any>
    maxRetries: number
    errorDelay: number

    constructor(private readonly configService: ConfigService) {
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
        this.maxRetries = parseInt(process.env.MAIL_MAX_RETRIES)
        this.errorDelay = parseInt(process.env.MAIL_ERROR_DELAY)
    }

    
    private  passToMailserver(
        recipient: string,
        subject: string,
        message: string,
    ): void {
        const mailer = this.mailTransport.sendMail({
            to: recipient,
            from: process.env.MAIL_ADRESS,
            subject: subject,
            html: message,
        })
        return mailer.pipe(
            retryWhen((errors) =>
                errors.pipe(
                    scan(
                        // If an error occurs retry and increment the error count
                        (acc, error) => ({
                            count: acc.count + 1,
                            error,
                        }),
                        { count: 0, error: undefined as any },
                    ),
                    // Retry for a set amount of times
                    tap((current) => {
                        if (current.count > this.maxRetries) {
                            throw new ServiceUnavailableException('This is an issue on our side. Please retry later.')
                        }
                    }),
                    delay(this.errorDelay),
                ),
            ),
        )
    }

    async sendMail(recipient: string, template: string, mailData: (MailVerifyDto | MailPwResetDto), subject ): Promise<void>{
        const mailTemplate = await readFile(dirname + '/templates/' + template + '.ejs', 'utf-8')
        const mailContent = render(mailTemplate, mailData as any)
        this.passToMailserver(recipient, subject, mailContent)
    }

   
}
