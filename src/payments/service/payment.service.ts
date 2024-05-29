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
import { MailService } from 'src/mail/mail.service';
import {
  PaymentSubject,
  purchasePointResponse,
} from '../../common/constant/message/msg.response';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private mailService: MailService,
  ) {}

  async createPaymentWithStripe(
    payload: PaymentWithStripeDto,
    user: UserDocument,
  ) {
    const { point, nameOnCard, charge } = payload;

    const { card, amount } = charge;

    const stripeCharge = await createCharge({
      card,
      amount,
    });

    const payment = await this.paymentModel.create({
      userId: user._id,
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

    let template = await purchasePointResponse(amount, point);
    let subject = PaymentSubject;

    await this.mailService.sendEmail(user.email, subject, template);

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

    let template = await purchasePointResponse(amount, point);
    let subject = PaymentSubject;

    await this.mailService.sendEmail(user.email, subject, template);

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
