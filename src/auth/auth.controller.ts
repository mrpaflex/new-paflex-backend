import { Controller, Get, Req, UseGuards, Param, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RequestOtpDto } from 'src/otp/dto/otp.dto';

@Controller('google')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() request: Request) {}

  @Get('redirect/:referralId?')
  @UseGuards(AuthGuard('google'))
  async create(
    @Req() request: Request,
    @Param('referralId') referralId: string,
  ) {
    return this.authService.create(request, referralId);
  }

   @Post('request-otp')
  async requestOtp(@Body() payload: RequestOtpDto) {
    return await this.authService.requestOtp(payload)
  }
}
