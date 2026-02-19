import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BattlesService } from './battles.service';
import { StartBattleDto } from './dto/start-battle.dto';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  async start(@Request() req, @Body() dto: StartBattleDto) {
    return this.battlesService.startBattle(req.user.userId, dto);
  }
}