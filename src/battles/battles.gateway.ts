import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebsocketsService } from './websockets.servie';

@WebSocketGateway({ cors: { origin: '*' } })
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

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
}