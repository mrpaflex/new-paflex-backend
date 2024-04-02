import * as bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
  const salt = 10;
  return await bcrypt.hash(password, salt);
};

export const comparedHashedPassword = async (
  password: string,
  dbPassword: string,
) => {
  return await bcrypt.compare(password, dbPassword);
};
