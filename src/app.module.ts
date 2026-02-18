import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CharactersModule } from './characters/characters.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, CharactersModule, ConfigModule.forRoot({
              isGlobal: true,
           }), UsersModule, AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
