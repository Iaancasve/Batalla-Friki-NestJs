import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartBattleDto } from './dto/start-battle.dto';

@Injectable()
export class BattlesService {

    private readonly logger = new Logger('BattlesService');

    constructor(private prisma: PrismaService) { }

    async startBattle(userId: number, dto: StartBattleDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const character = await this.prisma.character.findUnique({ where: { id: dto.characterId } });

        if (!user || !character) throw new BadRequestException('Usuario o personaje no encontrado');
        if (user.level < character.levelRequired) {
            throw new BadRequestException(`Nivel insuficiente. Requieres nivel ${character.levelRequired}`);
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
            include: { character1: true, character2: true },
        });

        if (!battle || battle.status === 'FINISHED') {
            throw new BadRequestException('Batalla no encontrada o finalizada');
        }


        if (!battle.player2Id) {
            return this.executePvE(battle, attackerId);
        }

        return this.executePvP(battle, attackerId);
    }


    private async executePvE(battle: any, attackerId: number) {
        const playerDamage = battle.character1.attack;
        const updatedTarget = await this.prisma.character.update({
            where: { id: battle.character2Id },
            data: { hp: { decrement: playerDamage } },
        });

        let isGameOver = updatedTarget.hp <= 0;
        let aiCounterAttack: any = null;

        if (!isGameOver) {
            const aiDamage = battle.character2.attack;
            const updatedPlayerChar = await this.prisma.character.update({
                where: { id: battle.character1Id },
                data: { hp: { decrement: aiDamage } },
            });

            aiCounterAttack = {
                attackerName: battle.character2.name,
                damageApplied: aiDamage,
                targetHp: updatedPlayerChar.hp < 0 ? 0 : updatedPlayerChar.hp,
            };

            if (updatedPlayerChar.hp <= 0) isGameOver = true;
        }

        if (isGameOver) {
            const playerWon = updatedTarget.hp <= 0;
            await this.finishBattle(battle.id, playerWon ? attackerId : 0);
        }

        return {
            attackerName: battle.character1.name,
            targetName: updatedTarget.name,
            damageApplied: playerDamage,
            targetHp: updatedTarget.hp < 0 ? 0 : updatedTarget.hp,
            isGameOver,
            aiCounterAttack,
        };
    }


    private async executePvP(battle: any, attackerId: number) {
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
            data: { hp: { decrement: damage } },
        });

        const isGameOver = updatedTarget.hp <= 0;

        if (isGameOver) {
            await this.finishBattle(battle.id, attackerId, targetUserId);
        }

        return {
            attackerName: attackerChar.name,
            targetName: updatedTarget.name,
            damageApplied: damage,
            targetHp: updatedTarget.hp < 0 ? 0 : updatedTarget.hp,
            isGameOver,
        };
    }
    async joinBattle(battleId: number, userId: number, characterId: number) {
        const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });

        if (!battle) throw new BadRequestException('Batalla no encontrada');
        if (battle.player2Id) throw new BadRequestException('La sala ya está llena');
        if (battle.player1Id === userId) throw new BadRequestException('No puedes unirte a tu propia partida');

        return this.prisma.battle.update({
            where: { id: battleId },
            data: {
                player2Id: userId,
                character2Id: characterId, 
                status: 'STARTED'
            },
            include: { character1: true, character2: true }
        });
    }


    private async finishBattle(battleId: number, winnerId: number, loserId?: number) {
        return this.prisma.$transaction(async (tx) => {
            await tx.battle.update({
                where: { id: battleId },
                data: { status: 'FINISHED', winnerId },
            });

            if (winnerId > 0) {
                const winner = await tx.user.findUnique({ where: { id: winnerId } });
                if (winner) {
                    let newXp = (winner.xp || 0) + 10;
                    let newLevel = winner.level;
                    if (newXp >= 100) { newLevel++; newXp -= 100; }
                    await tx.user.update({
                        where: { id: winnerId },
                        data: { xp: newXp, level: newLevel, wins: { increment: 1 } },
                    });
                }
            }

            if (loserId) {
                await tx.user.update({
                    where: { id: loserId },
                    data: { losses: { increment: 1 } },
                });
            }
        });
    }
}