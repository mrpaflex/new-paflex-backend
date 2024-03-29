import { Controller, Get, Req, UseGuards, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('google')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(
    @Req() request: Request,
    @Session() session: Record<string, any>,
  ) {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async create(
    @Req() request: Request,
    @Session() session: Record<string, any>,
  ) {
    const referralId = session.referralId;
    return this.authService.create(request, referralId);
  }
}
