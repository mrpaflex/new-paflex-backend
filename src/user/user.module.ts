import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { PostsModule } from 'src/posts/posts.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    PostsModule,
    OtpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
