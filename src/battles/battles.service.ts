import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class BattlesService {
  private readonly logger = new Logger('BattlesGateway'); 
  constructor(private prisma: PrismaService) {}

  async startBattle(userId: number, dto: StartBattleDto) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId } 
    });
    const character = await this.prisma.character.findUnique({ 
      where: { id: dto.characterId } 
    });

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

  async handleAttack(battleId: number, damage: number) {
  const battle = await this.prisma.battle.findUnique({
    where: { id: battleId },
  });

  if (!battle) throw new Error('Batalla no encontrada');

  const updatedCharacter = await this.prisma.character.update({
    where: { id: battle.character2Id },
    data: {
      hp: {
        decrement: damage 
      }
    }
  });

  this.logger.log(`Personaje ${updatedCharacter.name} herido. Vida restante: ${updatedCharacter.hp}`);

  return {
    battleId,
    characterName: updatedCharacter.name,
    newHp: updatedCharacter.hp,
    isDead: updatedCharacter.hp <= 0
  };
}
}