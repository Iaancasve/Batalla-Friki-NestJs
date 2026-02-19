import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class BattlesService {
  private readonly logger = new Logger('BattlesService');

  constructor(private prisma: PrismaService) {}

  async startBattle(userId: number, dto: StartBattleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const character = await this.prisma.character.findUnique({ where: { id: dto.characterId } });

    if (!user || !character) {
      throw new BadRequestException('Usuario o personaje no encontrado');
    }

    if (user.level < character.levelRequired) {
      throw new BadRequestException('Tu nivel es insuficiente para usar este personaje');
    }

    return this.prisma.battle.create({
      data: {
        player1Id: userId,
        character1Id: dto.characterId,
        player2Id: dto.rivalId || null,
        character2Id: dto.rivalCharacterId,
        status: 'STARTED',
      },
    });
  }

  async handleAttack(battleId: number, attackerId: number) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        character1: true,
        character2: true,
      },
    });

    if (!battle || battle.status === 'FINISHED') {
      throw new BadRequestException('Batalla no encontrada o ya finalizada');
    }

    let attackerChar, targetChar, targetId, targetUserId;

    if (attackerId === battle.player1Id) {
      attackerChar = battle.character1;
      targetChar = battle.character2;
      targetId = battle.character2Id;
      targetUserId = battle.player2Id;
    } else {
      attackerChar = battle.character2;
      targetChar = battle.character1;
      targetId = battle.character1Id;
      targetUserId = battle.player1Id;
    }

    
    const damage = attackerChar.attack;

    
    const updatedTarget = await this.prisma.character.update({
      where: { id: targetId },
      data: { hp: { decrement: damage } }
    });

    const isGameOver = updatedTarget.hp <= 0;

    if (isGameOver) {
      await this.prisma.$transaction(async (tx) => {
        
        await tx.battle.update({
          where: { id: battleId },
          data: { status: 'FINISHED', winnerId: attackerId }
        });

        
        const winner = await tx.user.findUnique({ where: { id: attackerId } });
        if (winner) {
          let newXp = (winner.xp || 0) + 10;
          let newLevel = winner.level;

          
          if (newXp >= 100) {
            newLevel++;
            newXp -= 100;
          }

          await tx.user.update({
            where: { id: attackerId },
            data: { xp: newXp, level: newLevel, wins: { increment: 1 } }
          });
        }

       
        if (targetUserId) {
          await tx.user.update({
            where: { id: targetUserId },
            data: { losses: { increment: 1 } }
          });
        }
      });
    }

    return {
      attackerName: attackerChar.name,
      targetName: updatedTarget.name,
      damageApplied: damage,
      targetHp: updatedTarget.hp < 0 ? 0 : updatedTarget.hp,
      isGameOver
    };
  }
}