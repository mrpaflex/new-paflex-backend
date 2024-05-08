import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super({ usernameFiled: 'email' });
  }

  async validate(
    payload?: any,
    referralId?: string,
    phoneNumber?: string,
    password?: string,
  ) {
    try {
      if (payload) {
        await this.authService.create(payload, referralId);
      }
      if (phoneNumber) {
        await this.userService.loginWithPhoneNumber({ phoneNumber, password });
      }
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException(error);
    }
  }
}
