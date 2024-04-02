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

  GoogleSuperMethod: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  },

  ACCESS_TOKEN: {
    JWT_MAIN_SECRET: process.env.JWT_MAIN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRE_TIME: process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  },

  REFERRAL: {
    ReferralPoint: +process.env.ReferralPoint,
  },

  CLOUDINARY: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  },

  CONN_PORT: {
    PORT: process.env.PORT,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },
};
