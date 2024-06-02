import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { WithdrawalService } from '../service/withdrawal.service';
import { WithdrawalDocument } from '../schemas/withdrawal.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateWithdrawalDto } from '../dto/withdrawal.dto';
import { UserDocument } from 'src/user/schemas/user.schema';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private withdrawalService: WithdrawalService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async makeWithdrawal(
    @Body() payload: CreateWithdrawalDto,
    @CurrentUser() user: UserDocument,
  ): Promise<String> {
    return await this.withdrawalService.makeWithdrawal(payload, user);
  }
}
