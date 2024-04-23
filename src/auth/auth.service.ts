import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import { GoogleCreateUserDto, RequestOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private otpService: OtpService,
  ) {}
  async create(payloadInput: GoogleCreateUserDto, referralId: string) {
    const { email } = payloadInput;

    const userExist = await this.userService.getByEmail(email);

    if (userExist) {
      return await this.jwtAccessToken(userExist);
    }

    const createdUser = await this.userService.create(payloadInput, referralId);
    return await this.jwtAccessToken(createdUser);
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

  async jwtAccessToken(payload: any) {
    payload = {
      id: payload._id,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    const accessToken = this.jwt.sign(payload);

    return accessToken;
  }
}
