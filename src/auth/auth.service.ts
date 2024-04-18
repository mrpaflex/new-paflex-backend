import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import { RequestOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private otpService: OtpService,
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

      return accessToken;
    }
    const createdUser = await this.userService.create(req, referralId);
    const payload = {
      id: createdUser._id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
    };
    const token = this.jwt.sign(payload);
    return token;
  }

  async requestOtp(payload: RequestOtpDto) {
    const { email, type, phoneNumber } = payload;

    if (!email && !phoneNumber) {
      throw new BadRequestException('PhoneNumber or Email is required');
    }
    await this.userService.findUserByPhoneNumberOrEmail(email, phoneNumber);

    const otp = await this.otpService.sendOtp({
      email: email,
      phoneNumber: phoneNumber,
      type: type,
    });

    return otp;
  }
}
