import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}
  async create(req: any, referralId: string) {
    const { email, accessToken } = req.user;
    const userExist = await this.userService.getByEmail(email);
    if (userExist) {
      const payload = {
        id: userExist._id,
        firstName: userExist.firstName,
        lastName: userExist.lastName,
      };

      const accessToken = this.jwt.sign(payload);
      return {
        Response: `you sign up already your access token is ${accessToken}`,
      };
    }
    await this.userService.create(req, referralId);
    return `You just sign up`;
  }
}
