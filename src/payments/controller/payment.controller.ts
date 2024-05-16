import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentDto } from '../dto/payment.dto';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async makePayment(
    @Body() payload: PaymentDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.paymentService.createPayment(payload, user._id);
  }
}
