import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { UserDocument } from 'src/user/schemas/user.schema';
import { LiveStreamService } from '../service/live-stream.service';
import { StartLiveDto, StopLiveDto } from '../dto/live-stream.dto';

@Controller('live')
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('start')
  async start(
    @Body() payload: StartLiveDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.liveStreamService.startLive(payload, user._id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stop/:id')
  async stop(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return await this.liveStreamService.stopLive(id, user._id);
  }
}
