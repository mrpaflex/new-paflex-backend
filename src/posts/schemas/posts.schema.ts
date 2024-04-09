import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PostType } from 'src/common/constant/enum/enum';
import { User } from 'src/user/schemas/user.schema';
import { FileDB, ReactionsType } from './sub-posts.schema';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';

export type PostsDocument = PostEntity & Document;
@Schema({ timestamps: true })
export class PostEntity {
  @Prop({ required: true })
  type: PostTypeEnum;

  @Prop({ type: String })
  text?: string;

  @Prop({ type: [FileDB], default: [] })
  images?: FileDB[];

  @Prop({ type: [FileDB], default: [] })
  video?: FileDB[];

  @Prop({ type: Boolean, default: false })
  isPostEdited: boolean;

  @Prop({ type: Boolean, default: false })
  isVideo: boolean;

  @Prop({ type: String, enum: PostType, default: PostType.PUBLIC })
  postType: PostType;

  @Prop({ type: Number, default: 0 })
  sharesCount: number;

  @Prop({ type: Number, default: 0 })
  commentsTotalCount: number;

  @Prop({ type: Boolean, default: false })
  isPostRestricted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creatorId: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  reactionTotal: number;

  @Prop({ type: [ReactionsType], default: [] })
  reactions?: ReactionsType[];
}

export const PostSchema = SchemaFactory.createForClass(PostEntity);
