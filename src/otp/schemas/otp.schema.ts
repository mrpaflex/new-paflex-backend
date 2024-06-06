import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpType } from '../enum/otp.enum';

export type OtpDocument = Otp & Document;
@Schema()
export class Otp {
  @Prop({ type: String })
  email: string;

  @Prop({ type: String, enum: OtpType, required: true })
  type: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000),
    expires: '15m',
  })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
