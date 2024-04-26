import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpType } from '../enum/otp.enum';

export type OtpDocument = Otp & Document;
@Schema({ expires: 600 })
export class Otp {
  @Prop({ unique: true })
  email: string;

  @Prop({ type: String, enum: OtpType, required: true })
  type: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ unique: true })
  phoneNumber: string;

  @Prop({ default: new Date(), expires: 600 }) //2 minutes
  createdAt: Date;

  @Prop({ default: Date.now(), expires: 600 })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
