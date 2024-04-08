import { Module } from '@nestjs/common';
import { ChatsGateway } from './gateway/chat.gateway';

@Module({
  providers: [ChatsGateway],
  exports: [ChatsGateway],
})
export class ChatsModule {}
