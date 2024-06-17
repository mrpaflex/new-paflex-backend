import * as dotenv from 'dotenv';
dotenv.config();
export const ENVIRONMENT = {
  GOOGLE: {
    SMTP_USER: process.env.SMTP_USER,
    AUTH_PASS: process.env.AUTH_PASS,
  },

  TWILLO: {
    account_id: process.env.ACCOUNT_ID,
    authToken: process.env.AUTH_TOKEN,
    FROM: process.env.FROM,
  },

  TERMII: {
    TERMII_API_KEY: process.env.TERMII_KEY,
    SENDER_ID: process.env.SENDER_ID,
  },

  ACCESS_TOKEN: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME,
  },

  REFERRAL: {
    ReferralPoint: +process.env.ReferralPoint,
  },

  AWS: {
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    Bucket: process.env.AWS_BUCKET_FOLDER_NAME,
    BucketName: process.env.AWS_BUCKET_NAME,
  },

  CONNECTION: {
    PORT: process.env.PORT,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },

  PERCENTAGE: {
    PERCENTAGE: process.env.PERCENTAGE,
  },
  STRIPE: {
    STRIPE_ID: process.env.STRIPE_PUBLIC_ID,
    STRIPE_SECRET: process.env.STRIPE_SECRET,
  },

  PAYSTACK: {
    PAYSTACK_SECRET: process.env.PAYSTACK_SECRET,
    PAYSTACK_URL: process.env.PAYSTACK_URL,
  },

  THROTTLE: {
    TTL: process.env.TTL,
    LIMIT: process.env.LIMIT,
  },
};
