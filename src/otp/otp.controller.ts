import { Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ValidateOtpDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post()
  async verify(payload: ValidateOtpDto) {
    // const { email, code, phoneNumber } = payload;
    return await this.otpService.validateOtp(payload);
  }
}
