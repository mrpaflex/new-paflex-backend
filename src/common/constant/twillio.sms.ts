import { Twilio } from 'twilio';
import { ENVIRONMENT } from './environmentVariables/environment.var';
import { generateOtpCode } from './generateCode/random.code';
import { String } from 'aws-sdk/clients/cloudsearchdomain';

export const TwilioSms = async (phoneNumber: string, template: string) => {
  const client = new Twilio(
    ENVIRONMENT.TWILLO.account_id,
    ENVIRONMENT.TWILLO.authToken,
  );

  const msg = await client.messages.create({
    body: template,
    from: ENVIRONMENT.TWILLO.FROM,
    to: `${phoneNumber}`,
  });

  return msg;
};
