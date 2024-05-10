import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LiveStreamDocument = LiveStream & Document;

@Schema()
export class LiveStream {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creatorId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now() })
  liveStartTime: Date;

  @Prop({ type: Date })
  liveStopTime?: Date;

  @Prop({ type: Date })
  liveStreamDuration?: Date;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  giftBy: mongoose.Types.ObjectId[];
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);
