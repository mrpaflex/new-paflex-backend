import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import Stripe from 'stripe';
import { CreateChargeDto } from '../dto/payment.dto';

const stripe = new Stripe(ENVIRONMENT.STRIPE.STRIPE_SECRET, {
  apiVersion: '2024-04-10',
});

export const createCharge = async (payload: CreateChargeDto) => {
  try {
    const { amount } = payload;

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: 'pm_card_visa',
      amount: amount * 100,
      confirm: true,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (error) {
    throw error; // or handle the error as needed
  }
};
