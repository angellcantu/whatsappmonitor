import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({namespace: 'messages'})
export class MessageGateway {
  @WebSocketServer() server: Server;

  emitNewMessageEvent(message: any) {
    this.server.emit('newMessage', message);
  }
}