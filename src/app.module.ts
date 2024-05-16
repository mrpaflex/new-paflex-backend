import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { MessageModule } from './message/message.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { ChatsModule } from './websocket/module/chat.module';
import { GiftModule } from './gift/module/gift.module';
import { LiveStreamModule } from './livestream/module/video.livestream.module';
import { PaymentModule } from './payments/module/payment.module';

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
    ChatsModule,
    GiftModule,
    LiveStreamModule,
    PaymentModule,
  ],
})
export class AppModule {}
