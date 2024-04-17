import { Twilio } from 'twilio';
import { ENVIRONMENT } from '../environmentVariables/environment.var';

export const TwilioSms = async (phoneNumber: string, template: string) => {
  const client = new Twilio(
    ENVIRONMENT.TWILLO.account_id,
    ENVIRONMENT.TWILLO.authToken,
  );

  await client.messages.create({
    body: template,
    from: ENVIRONMENT.TWILLO.FROM,
    to: `${phoneNumber}`,
  });

  return;
};
