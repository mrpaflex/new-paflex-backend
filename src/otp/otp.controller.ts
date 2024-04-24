import { Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ValidateOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('validate-otp')
  async validate(payload: ValidateOtpDto) {
    return await this.otpService.validateOtp(payload);
  }

  @Post('verify-otp')
  async verify(payload: VerifyOtpDto) {
    return await this.otpService.verifyOtp(payload);
  }
}
