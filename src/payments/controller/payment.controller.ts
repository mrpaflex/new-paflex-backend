import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentDto, PaymentWithStripeDto } from '../dto/payment.dto';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('paystack')
  async makePaymentWithPayStack(
    @Body() payload: PaymentDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.paymentService.makePaymentWithPayStack(payload, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('stripe')
  async createPaymentWithStripe(
    @Body() payload: PaymentWithStripeDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.paymentService.createPaymentWithStripe(payload, user);
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return await this.paymentService.verifyPayment(reference);
  }
}
