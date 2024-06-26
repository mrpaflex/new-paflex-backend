import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FileDB, ReactionsType } from './sub-posts.schema';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
export type CommentDocument = Comment & Document;
@Schema()
export class Comment {
  @Prop({ required: true })
  commentType: PostTypeEnum;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostEntity',
    required: true,
  })
  postId: mongoose.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.ObjectId;

  @Prop({ type: String })
  comment?: string;

  @Prop({ type: Boolean, default: false })
  isCommentEdited: boolean;

  @Prop({ type: [FileDB], default: [] })
  image?: FileDB[];

  @Prop({ type: [FileDB], default: [] })
  video?: FileDB[];

  @Prop({ type: Boolean, default: false })
  isCommentRestricted: boolean;

  @Prop({ type: Number, default: 0 })
  reactionCount: number;

  @Prop({ type: Number, default: 0 })
  replyToCommentTotalCount: number;

  @Prop({ type: [ReactionsType], default: [] })
  commentReactions?: ReactionsType[];

  @Prop({ type: Date, default: Date.now })
  commentAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
