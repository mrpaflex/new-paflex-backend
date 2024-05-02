import * as randomstring from 'randomstring';

export const generateOtpCode = {
  generateString: async () => {
    return Math.round(Math.random() * 10000).toString();
  },
};

export const AutoUsername = async () => {
  return randomstring.generate({
    length: 7,
    charset: 'alphabetic',
  });
};
