import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatConnectionService } from './chat-connection.service';

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
    private readonly connectionService: ChatConnectionService,
  ){}

  afterInit(server: Server) {
    console.log('Gateway inicializando');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    this.connectionService.removeUser(client.id);
    this.server.emit('usuarioDesconectado', { socketId: client.id});
  }

  @SubscribeMessage('identify')
  handleIdentify(
    @MessageBody() data: { userId: string},
    @ConnectedSocket() client: Socket,
  ){
    this.connectionService.addUser(data.userId, client.id);
    console.log(`Usuario ${data.userId} conectado con socket ${client.id}`);
    this.server.emit('usuarioConectado', { userId: data.userId });
  }

  @SubscribeMessage('joinchat')
  async handleJoinChat(
    @MessageBody() data: { usuarioId: string; organizacionId: string}, 
    @ConnectedSocket() client: Socket){
    const { chat } = await this.chatService.iniciarChat(
      data.usuarioId,
      data.organizacionId,
    )
    client.join(chat.id);
    console.log(`Cliente ${client.id} se unió al chat ${chat.id}`);

    const mensajesResponse = await this.chatService.getMensajesDeChat(chat.id);

    client.emit('chatIdAsignado', { 
      chatId: chat.id,
      mensajes: mensajesResponse.mensajes,
    });
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

