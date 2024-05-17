import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Model } from 'mongoose';
import { PaymentDto } from '../dto/payment.dto';
import { createCharge } from '../stripe/payment.stripe';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(payload: PaymentDto, userId: string) {
    const { paymentType, point, nameOnCard, charge } = payload;

    const { card, amount } = charge;

    const stripeCharge = await createCharge({
      card,
      amount,
    });

    const payment = await this.paymentModel.create({
      userId: userId,
      transactionReferenceId: stripeCharge.id,
      transactionStatus: stripeCharge.status,
      amount: amount,
      point: point,
      paymentType: paymentType,
      cardDetails: {
        nameOnCard: nameOnCard,
        number: card.number,
      },
    });

    return payment;
  }
}
