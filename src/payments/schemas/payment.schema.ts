import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CardDetail } from './sub.payment.schema';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String })
  transactionReference?: string;

  @Prop({ type: String })
  transactionStatus?: string;

  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: Number, required: true })
  point: number;

  @Prop({ type: String })
  currency: any;

  @Prop({ type: String })
  paymentType?: string;

  @Prop({ type: [String], default: [] })
  channel: [string];

  @Prop({ type: String })
  gateway_response?: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  paid_at: Date;

  @Prop({ type: CardDetail })
  cardDetails?: CardDetail;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
