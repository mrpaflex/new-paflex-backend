import axios from 'axios';
import { ENVIRONMENT } from '../environmentVariables/environment.var';

const data = {
  api_key: ENVIRONMENT.TERMII.TERMII_API_KEY,
  sender_id: ENVIRONMENT.TERMII.SENDER_ID,
  usecase: `Your OTP code is zxsds`,
  company: 'Acme Corp',
};

const options = {
  method: 'POST',
  url: 'https://api.ng.termii.com/api/sender-id/request',
  headers: {
    'Content-Type': 'application/json',
  },
  data: data,
};

export const TermiiSendSMS = async () => {
  try {
    const response = await axios(options);
    console.log('successful', response.data);
    return response.data;
  } catch (error) {
    console.log('Error:', error.response.data);
    throw error;
  }
};
