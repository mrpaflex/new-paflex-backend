import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { liveGift } from './sub-live-stream.schema';

export type LiveStreamDocument = LiveStream & Document;

@Schema()
export class LiveStream {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creatorId: mongoose.Types.ObjectId;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false, required: true })
  isLiveActive: boolean;

  @Prop({ type: Date, default: Date.now() })
  liveStartTime: Date;

  @Prop({ type: Date })
  liveStopTime?: Date;

  @Prop({ type: String })
  streamDuration?: any;

  @Prop({ type: [liveGift], default: [] })
  gifts?: liveGift[];
}

export const LiveStreamSchema = SchemaFactory.createForClass(LiveStream);
