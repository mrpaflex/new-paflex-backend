import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CardDetail } from './sub.payment.schema';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  transactionReferenceId: string;

  @Prop({ type: String, required: true })
  transactionStatus: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  point: number;

  @Prop({ type: String, required: true })
  paymentType: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: CardDetail, required: true })
  cardDetails: CardDetail;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
