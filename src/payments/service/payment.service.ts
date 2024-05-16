import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Model } from 'mongoose';
import { PaymentDto } from '../dto/payment.dto';

import Stripe from 'stripe';
import { createCharge } from '../stripe/payment.stripe';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(payload: PaymentDto, userId: string) {
    const { paymentType, point, charge } = payload;

    const { card, amount } = charge;

    const stripeCharge = await createCharge({
      card,
      amount,
    });

    console.log(
      'status',
      stripeCharge.status,
      'id',
      stripeCharge.id,
      'payment type',
      stripeCharge.payment_method_types,
    );

    return;
  }
}
