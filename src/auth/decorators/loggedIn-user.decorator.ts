import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from 'src/common/constant/enum/enum';
import { UserDocument } from 'src/user/schemas/user.schema';

export interface ILoggedInUser {
  _id: string;
  email: string;
  role: UserType;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Promise<UserDocument> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
