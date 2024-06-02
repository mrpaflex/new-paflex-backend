import { Module } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentController } from '../controller/payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { MailModule } from 'src/mail/mail.module';
import { WithdrawalController } from '../controller/withdrawal.controller';
import { WithdrawalService } from '../service/withdrawal.service';
import { Withdrawal, WithdrawalSchema } from '../schemas/withdrawal.schema';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
  ],
  controllers: [PaymentController, WithdrawalController],
  providers: [PaymentService, WithdrawalService],
})
export class PaymentModule {}
