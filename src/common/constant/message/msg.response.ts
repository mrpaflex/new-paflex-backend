export const ConstantMessage = {
  AccountVerificationTemplate: async (code: number) => {
    return `Kindly use the code below to activate your account ${code}`;
  },

  ResetPasswordTemplate: async (code: number) => {
    return `Verify your action to reset your password ${code}`;
  },

  subject: `Action Required`,
};
