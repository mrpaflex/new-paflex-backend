import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gift, GiftSchema } from '../schemas/gift.schema';
import { GiftService } from '../service/gift.service';
import { GiftController } from '../controller/gift.controller';
import { PostsModule } from 'src/posts/posts.module';
import { UserModule } from 'src/user/user.module';
import { LiveStreamModule } from 'src/livestream/module/video.livestream.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gift.name, schema: GiftSchema }]),
    PostsModule,
    UserModule,
    LiveStreamModule,
  ],
  controllers: [GiftController],
  providers: [GiftService],
})
export class GiftModule {}
