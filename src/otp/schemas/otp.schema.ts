import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpType } from '../enum/otp.enum';

export type OtpDocument = Otp & Document;
@Schema({ expires: 600 })
export class Otp {
  @Prop({ type: String })
  email: string;

  @Prop({ type: String, enum: OtpType, required: true })
  type: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: Date.now(), expires: 600 }) //10 minutes
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
