import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailController } from './mail.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
      transport: {
        host: configService.get<string>('MAIL_HOST'),
        port: configService.get<number>('MAIL_HOST_PORT'),
        secure: false,
        auth: {
          user: configService.get<string>('MAIL_USER'),
          pass: configService.get<string>('MAIL_PASS')
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
      template: {
        dir: process.cwd() + '/template/',
        adapter: new EjsAdapter(), 
        options: {
          strict: true,
        },
      },
    }), 
    inject: [ConfigService]
  })],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
