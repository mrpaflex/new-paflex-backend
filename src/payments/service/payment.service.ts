import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Model } from 'mongoose';
import { PaymentDto, PaymentWithStripeDto } from '../dto/payment.dto';
import { createCharge } from '../stripe/payment.stripe';
import {
  initializeTransaction,
  verifyPayStackPayment,
} from '../paystack/paystack.payment';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPaymentWithStripe(payload: PaymentWithStripeDto, userId: string) {
    const { point, nameOnCard, charge } = payload;

    const { card, amount } = charge;

    const stripeCharge = await createCharge({
      card,
      amount,
    });

    const payment = await this.paymentModel.create({
      userId: userId,
      transactionReference: stripeCharge.id,
      transactionStatus: stripeCharge.status,
      channel: stripeCharge.payment_method_types,
      amount: amount,
      point: point,
      paymentType: 'stripe',
      cardDetails: {
        nameOnCard: nameOnCard,
        number: card.number,
      },
    });

    return payment;
  }

  async makePaymentWithPayStack(payload: PaymentDto, user: UserDocument) {
    const { point, amount } = payload;

    const initializePayment = await initializeTransaction({
      amount,
      payingUser: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

    await this.paymentModel.create({
      userId: user._id,
      amount: amount,
      point: point,
      transactionReference: initializePayment.paymentReference,
    });

    return initializePayment;
  }

  async verifyPayment(reference: string) {
    const paymentIntent = await verifyPayStackPayment(reference);

    const { status, paid_at, channel, currency } = paymentIntent.data;

    await this.paymentModel.findOneAndUpdate(
      {
        transactionReference: reference,
      },
      {
        transactionStatus: status,
        paid_at: paid_at,
        channel: channel,
        paymentType: 'paystack',
        currency: currency,
      },
      { new: true },
    );
    return true;
  }
}
