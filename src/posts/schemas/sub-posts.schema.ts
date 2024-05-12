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
export class FileDB {
  @Prop()
  location: string;

  @Prop()
  key: string;
}

@Schema()
export class PostGift {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  giftedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: Date, default: Date.now })
  giftDate?: Date;
}
