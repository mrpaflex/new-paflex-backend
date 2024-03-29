export const ConstantMessage = {
  template: async (code: number) => {
    return `you want to delete your post, kindly use the code ${code} to confirmed your action`;
  },

  subject: `Action Required`,
};
