import * as randomString from 'randomstring';

export const generateOtpCode = randomString.generate({
  length: 4,
  charset: 'numeric',
});
