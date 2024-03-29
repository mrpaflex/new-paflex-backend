import * as randomString from 'randomstring';

export const generateOtpCode = randomString.generate({
  length: 5,
  charset: 'numeric',
});
