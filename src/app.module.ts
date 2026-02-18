import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CharactersModule } from './characters/characters.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, CharactersModule, ConfigModule.forRoot({
              isGlobal: true,
           }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
