import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import {
  IPaymentInitializeRequest,
  IPaymentInitializeResponse,
} from './interface/interface.paystack.payment';
import axios from 'axios';

export const initializeTransaction = async (
  payload: IPaymentInitializeRequest,
): Promise<IPaymentInitializeResponse> => {
  const { payingUser, amount } = payload;

  const paystackBase_url =
    ENVIRONMENT.PAYSTACK.PAYSTACK_URL + `/transaction/initialize`;
  const secret = ENVIRONMENT.PAYSTACK.PAYSTACK_SECRET;

  const headers = {
    Authorization: `Bearer ${secret}`,
    'content-type': 'application/json',
    'cache-control': 'no-cache',
  };

  const realAmount = amount * 100;
  try {
    const payload: any = {
      amount: realAmount,
      email: payingUser.email,
      metadata: {
        full_name: `${payingUser.firstName} ${payingUser.lastName}`,
      },
    };
    const response = await axios.post(paystackBase_url, payload, { headers });
    if (!response.data && response.status !== 200) {
      throw new Error('An error occurred, please try again');
    }

    const { authorization_url, access_code, reference } = response.data.data;

    return {
      paymentProviderRedirectUrl: authorization_url,
      paymentReference: reference,
      accessCode: access_code,
    };
  } catch (error) {
    console.log('Error', error);
    throw error.message;
  }
};

export const verifyPayStackPayment = async (reference: string) => {
  const paystackBase_url =
    ENVIRONMENT.PAYSTACK.PAYSTACK_URL + `/transaction/verify/${reference}`;
  const secret = ENVIRONMENT.PAYSTACK.PAYSTACK_SECRET;

  const headers = {
    Authorization: `Bearer ${secret}`,
    'content-type': 'application/json',
    'cache-control': 'no-cache',
  };

  const response = await axios.get(paystackBase_url, { headers });

  if (response.status !== 200 || !response.data) {
    throw new Error('Verification failed, please try again');
  }

  return response.data;
};
