import { Module } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentController } from '../controller/payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
   MailModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
