import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MessageDocument = Message & Document;
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  senderId: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  receiverId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
