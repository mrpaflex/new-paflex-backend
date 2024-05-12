import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class liveGift {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  giftedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: Date, default: Date.now })
  giftDate?: Date;
}
