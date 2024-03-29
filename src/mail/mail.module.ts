import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: ENVIRONMENT.GOOGLE.SMTP_USER,
          pass: ENVIRONMENT.GOOGLE.AUTH_PASS,
        },
      },

      defaults: {
        from: '"No Reply" <noreply@paflex.com>',
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
