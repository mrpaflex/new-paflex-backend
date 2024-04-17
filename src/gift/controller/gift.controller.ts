import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GiftService } from '../service/gift.service';
import { GiftPostDto } from '../dto/gift.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { UserDocument } from 'src/user/schemas/user.schema';

@Controller('gift')
export class GiftController {
  constructor(private giftService: GiftService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('post')
  async giftForPost(
    @Body() payload: GiftPostDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.giftService.giftForPost(payload, user);
  }
}
