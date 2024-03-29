import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { MessageService } from './message.service';
import { UserDocument } from 'src/user/schemas/user.schema';
import { MessageDTO } from './dto/chat.message.dto';
import { MessageDocument } from './schemas/message.schema';
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  async create(
    @Param('id') id: string,
    @Body() payload: MessageDTO,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.messageService.create(id, payload, user);
  }

  //this might be removed in the future or improve on it because it look like group chat to me
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(@CurrentUser() user: any): Promise<any[]> {
    return await this.messageService.getAll(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async YouAndMe(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<MessageDocument[]> {
    return await this.messageService.getChatByUserId(id, user);
  }
}
