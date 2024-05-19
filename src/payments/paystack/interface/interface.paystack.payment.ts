export interface IUser {
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface IPaymentInitializeRequest {
  amount: number;
  payingUser: IUser;
}

export interface IPaymentInitializeResponse {
  paymentProviderRedirectUrl: string;
  paymentReference: string;
  accessCode: string;
}
