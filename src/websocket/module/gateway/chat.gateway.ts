import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatDTO } from 'src/websocket/dto/chat.dto';

@WebSocketGateway(80, { namespace: 'chat' })
export class ChatsGateway {
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: ChatDTO) {
    this.server.emit('message', message);
  }
}
