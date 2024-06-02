import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type WithdrawalDocument = Withdrawal & Document;
@Schema()
export class Withdrawal {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Date, required: true, default: Date.now() })
  withdrawalTime: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
