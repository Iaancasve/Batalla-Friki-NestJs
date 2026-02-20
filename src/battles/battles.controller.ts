import { Controller, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BattlesService } from './battles.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { BattlesGateway } from './battles.gateway';


@Controller('battles')
export class BattlesController {
    constructor(
        private readonly battlesService: BattlesService,
        private readonly battlesGateway: BattlesGateway
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async startBattle(@Body() dto: StartBattleDto, @Request() req) {
        const userId = req.user.userId || req.user.sub;
        const battle = await this.battlesService.startBattle(userId, dto);

        
        this.battlesGateway.notifyNewBattle(battle);

        return battle;
    }
    @Patch(':id/join')
    @UseGuards(AuthGuard('jwt'))
    async join(@Param('id') id: string, @Body() body: { characterId: number }, @Request() req) {
        const userId = req.user.userId || req.user.sub;
        const battle = await this.battlesService.joinBattle(+id, userId, body.characterId);

        
        this.battlesGateway.server.to(`battle_${id}`).emit('opponentJoined', {
            battleId: id,
            character2: battle.character2
        });

        return battle;
    }
}