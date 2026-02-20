import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BattlesService } from './battles.service';
import { StartBattleDto } from './dto/start-battle.dto';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post() 
  @UseGuards(AuthGuard('jwt'))
  async startBattle(@Body() dto: StartBattleDto, @Request() req) {
   
    const userId = req.user.userId || req.user.sub; 
    return this.battlesService.startBattle(userId, dto);
  }
}