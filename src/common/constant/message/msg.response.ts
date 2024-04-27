export const ConstantMessage = {
  AccountVerificationTemplate: async (code: string) => {
    return `Kindly use the code below to activate your account ${code}`;
  },

  ResetPasswordTemplate: async (code: string) => {
    return `Verify your action to reset your password ${code}`;
  },

  subject: `Action Required`,
};
