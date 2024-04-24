import { Controller, Param, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  GoogleCreateUserDto,
  RequestOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  CreateUserDto,
  LoginUserDto,
  PasswordDto,
  VerifyPhoneNumberDto,
} from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('google/:referralId?')
  async create(
    @Body() payload: GoogleCreateUserDto,
    @Param('referralId') referralId: string,
  ) {
    return this.authService.create(payload, referralId);
  }

  @Post('phone-number/:referralId?')
  async createAccountWithPhoneNumber(
    @Param('referralId') referralId: string,
    @Body() payload: CreateUserDto,
  ) {
    return await this.userService.createAccountWithPhoneNumber(
      payload,
      referralId,
    );
  }

  @Post('phone-number-login')
  async login(@Body() payload: LoginUserDto) {
    return await this.userService.loginWithPhoneNumber(payload);
  }

  @Post('set-password')
  async setPassword(@Body() payload: PasswordDto) {
    return await this.userService.setPassword(payload);
  }

  @Post('verify-number')
  async verifyPhoneNumber(@Body() payload: VerifyPhoneNumberDto) {
    return await this.userService.verifyPhoneNumber(payload);
  }

  @Post('request-otp')
  async requestOtp(@Body() payload: RequestOtpDto) {
    return await this.authService.requestOtp(payload);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return await this.authService.forgetPassword(payload);
  }

  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return await this.authService.resetPassword(payload);
  }
}
