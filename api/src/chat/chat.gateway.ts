import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

@WebSocketGateway({namespace: '/ws-chat',
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
  ){}

  afterInit(server: Server) {
    console.log('Gateway inicializando');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinchat')
  async handleJoinChat(@MessageBody() data: { chatId: string}, @ConnectedSocket() client: Socket){
    client.join(data.chatId);
    console.log(`Cliente ${client.id} se unió al chat ${data.chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      chatId: string;
      autorId: string;
      contenido: string;
    },
    @ConnectedSocket() client: Socket,
  ){
    const mensaje = await this.chatService.crearMensaje(data.chatId, data.autorId, data.contenido);
    
    // Emitir el mensaje a todos los usuarios en la sala
    this.server.to(data.chatId).emit('messageReceived', mensaje)
  }
}

