import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ReactionsType } from './sub-posts.schema';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
export type CommentReplyDocument = CommentReply & Document;
@Schema()
export class CommentReply {
  @Prop({ required: true })
  replyType: PostTypeEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  commentId?: mongoose.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' })
  replyId?: mongoose.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.ObjectId;

  @Prop({ type: String })
  reply?: string;
  @Prop({ type: Boolean, default: false })
  isReplyEdited: boolean;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String })
  video?: string;

  @Prop({ type: String })
  cloudinary_Id?: string;

  @Prop({ type: Boolean, default: false })
  isReplyRestricted: boolean;

  @Prop({ type: Number, default: 0 })
  replyReactionCount: number;

  @Prop({ type: [ReactionsType], default: [] })
  replyReactions?: ReactionsType[];

  @Prop({ type: Number, default: 0 })
  replyToReplyTotalCount: number;

  @Prop({ type: Date, default: Date.now })
  commentAt: Date;
}

export const CommentReplySchema = SchemaFactory.createForClass(CommentReply);
