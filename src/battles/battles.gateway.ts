import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebsocketsService } from './websockets.servie';
import { SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Logger } from '@nestjs/common'; 

@WebSocketGateway({ cors: { origin: '*' } })
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
    private readonly logger = new Logger('BattlesGateway'); //

  constructor(
    private readonly jwtService: JwtService,
    private readonly websocketsService: WebsocketsService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers['token'] as string;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      this.websocketsService.registerClient(client);
      
      console.log(`Clientes conectados: ${this.websocketsService.getConnectedClients()}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.websocketsService.removeClient(client.id);
    console.log(`Clientes restantes: ${this.websocketsService.getConnectedClients()}`);
  }

  @SubscribeMessage('joinBattle')
  handleJoinBattle(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { battleId: number }
  ) {

    this.logger.debug(`Evento joinBattle recibido para la batalla: ${payload.battleId}`);

    if (!client) {
      this.logger.error('El objeto client (socket) es undefined'); //
      return { status: 'error', message: 'Socket no detectado' };
    }

    const roomName = `battle_${payload.battleId}`;
    client.join(roomName);

    this.logger.log(`Socket ${client.id} unido a ${roomName}`); //

    return {
      status: 'ok',
      message: `Te has unido a la sala ${roomName}`
    };
  }
}