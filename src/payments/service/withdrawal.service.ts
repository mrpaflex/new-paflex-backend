import { BadRequestException, Injectable } from '@nestjs/common';
import { Withdrawal, WithdrawalDocument } from '../schemas/withdrawal.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWithdrawalDto, WithdrawalInfo } from '../dto/withdrawal.dto';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Withdrawal.name)
    private readonly WithdrawalModel: WithdrawalDocument,
  ) {}

  async makeWithdrawal(
    payload: CreateWithdrawalDto,
    user: UserDocument,
  ): Promise<String> {
    const { amount, details } = payload;

    if (amount === 0 || !amount || amount < 0) {
      throw new BadRequestException('Invalid Amount');
    }

    if (amount > user.balance) {
      throw new BadRequestException('Insufficient Fund');
    }

    console.log(amount, user.balance);
    await this.sendWithdrawal(details);
    return `payment processing`;
  }

  async sendWithdrawal(payload: WithdrawalInfo) {
    console.log(payload);
  }
}
