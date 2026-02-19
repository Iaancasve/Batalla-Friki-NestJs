import { Module } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { BattlesController } from './battles.controller';
import { BattlesGateway } from './battles.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketsService } from './websockets.service';

@Module({
  imports: [
    PrismaModule, 
    AuthModule 
  ],
  controllers: [BattlesController],
  providers: [BattlesService, BattlesGateway, WebsocketsService],
})
export class BattlesModule {}