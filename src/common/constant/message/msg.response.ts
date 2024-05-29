export const ConstantMessage = {
  AccountVerificationTemplate: async (code: string) => {
    return `Kindly use the code below to activate your account ${code}`;
  },

  ResetPasswordTemplate: async (code: string) => {
    return `Verify your action to reset your password ${code}`;
  },

  paymentMade: async (amount: number, point: number) => {
    return `You just purchase ${point} point with ${amount}$`;
  },

  subject: `Action Required`,
};

export const purchasePointResponse = async (amount: number, point: number) => {
  return `You just purchase ${point} point with ${amount}$`;
};

export const PaymentSubject = 'Payment';
