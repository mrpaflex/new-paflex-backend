import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type GiftDocument = Gift & Document;
@Schema({ timestamps: true })
export class Gift {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PostEntity' })
  postId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Live' })
  liveId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiverId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Boolean, default: false })
  deliver: boolean;

  @Prop({ type: String, required: true, default: 'Unsuccessful' })
  transactionStatus: string;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
