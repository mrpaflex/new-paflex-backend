import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostEntity, PostSchema } from './schemas/posts.schema';
import { OtpModule } from 'src/otp/otp.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import {
  CommentReply,
  CommentReplySchema,
} from './schemas/commentReply.schema';

@Module({
  imports: [
    OtpModule,
    MongooseModule.forFeature([
      { name: PostEntity.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReply.name, schema: CommentReplySchema },
    ]),
  ],
  controllers: [PostsController, CommentController],
  providers: [PostsService, CommentService],
  exports: [PostsService],
})
export class PostsModule {}
