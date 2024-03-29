import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { MessageModule } from './message/message.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),

      inject: [ConfigService],
    }),

    UserModule,
    AuthModule,
    PostsModule,
    MessageModule,
    OtpModule,
    MailModule,
  ],
})
export class AppModule {}
