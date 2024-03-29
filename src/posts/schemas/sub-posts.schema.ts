import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PostReactionEnum } from 'src/common/enum/post.reactions.enum';
import { User } from 'src/user/schemas/user.schema';

@Schema()
export class ReactionsType {
  @Prop({ type: String, enum: PostReactionEnum })
  type?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  reactedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  reactionDate: Date;
}

@Schema()
export class PostImage {
  @Prop()
  url: string;

  @Prop()
  cloudinaryId: string;
}

@Schema()
export class PostVideo {
  @Prop()
  url: string;

  @Prop()
  cloudinaryId: string;
}
