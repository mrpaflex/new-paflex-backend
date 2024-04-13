import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;
@Schema({ expires: 2000 })
export class Otp {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: Date.now(), expires: 2000 })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
