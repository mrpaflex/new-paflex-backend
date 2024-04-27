import { randomBytes } from 'crypto';

export const generateOtpCode = {
  generateString: () => {
    return Math.round(Math.random() * 10000).toString();
  },
};
