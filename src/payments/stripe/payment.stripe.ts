import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import Stripe from 'stripe';
import { CreateChargeDto } from '../dto/payment.dto';

const stripe = new Stripe(ENVIRONMENT.STRIPE.STRIPE_SECRET, {
  apiVersion: '2024-04-10',
});

export const createCharge = async (payload: CreateChargeDto) => {
  try {
    const { card, amount } = payload;

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethod.id,
      amount: amount * 100,
      confirm: true,
      payment_method_types: ['card'],
      currency: 'usd',
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating charge:', error);
    throw error; // or handle the error as needed
  }
};

// export const createCharge = async (payload: CreateChargeDto) => {
//   const { card, amount } = payload;

//   const paymentMethod = await stripe.paymentMethods.create({
//     type: 'card',
//     card,
//   });
//   // console.log('stripe payment method', paymentMethod);

//   const paymentIntent = await stripe.paymentIntents.create({
//     payment_method: paymentMethod.id,
//     //payment_method: 'pm_card_visa',
//     amount: amount * 100,
//     confirm: true,
//     payment_method_types: ['card'],
//     currency: 'usd',
//   });

//   return paymentIntent;
// };
