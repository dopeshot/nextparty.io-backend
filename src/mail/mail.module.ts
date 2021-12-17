import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { ConfigModule} from '@nestjs/config'
import { MailController } from './mail.controller'

@Module({
    imports: [ConfigModule],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
