import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import {
  ForgotPasswordDto,
  GoogleCreateUserDto,
  RequestOtpDto,
  ResetPasswordDto,
  UpdateEmailDto,
} from './dto/auth.dto';
import { OtpType } from 'src/otp/enum/otp.enum';
import { hashPassword } from '../common/utils/hashed/password.bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private otpService: OtpService,
    private config: ConfigService,
  ) {}
  async create(payload: GoogleCreateUserDto, referralId?: string) {
    const { email } = payload;

    const userExist = await this.userService.getByEmail(email);

    if (userExist) {
      if (userExist.isGoogleAuth) {
        const accessToken = await this.jwtAccessToken(userExist);
        return {
          user: userExist,
          accessToken: accessToken,
        };
      } else if (!userExist.isGoogleAuth) {
        throw new BadRequestException(`Can not login`);
      }
    }

    const createdUser = await this.userService.create(payload, referralId);

    const accessToken = await this.jwtAccessToken(createdUser);

    return {
      createdUser,
      accessToken,
    };
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

  async jwtAccessToken(payload) {
    payload = {
      id: payload._id,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    const accessToken = this.jwt.sign(payload);

    return accessToken;
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    const { phoneNumber } = payload;
    await this.userService.getByPhoneNumber(phoneNumber);
    await this.otpService.sendOtp({
      email: null,
      phoneNumber: phoneNumber,
      type: OtpType.RESET_PASSWORD,
    });

    return 'otp sent';
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { phoneNumber, code, password } = payload;

    await this.otpService.verifyOtp({
      email: null,
      phoneNumber: phoneNumber,
      code: code,
      type: OtpType.RESET_PASSWORD,
    });

    const user = await this.userService.getByPhoneNumber(phoneNumber);

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;

    await user.save();
    return 'Password Changed Successfully';
  }

  async updateEmail(payload: UpdateEmailDto, user: UserDocument) {
    const { email } = payload;

    if (user.isGoogleAuth) {
      throw new BadRequestException('You can not change you google email');
    }

    user.email = email;

    await user.save();

    return user;
  }
}
