export class StartBattleDto {
  characterId: number;      // El personaje que elige el usuario
  rivalId?: number;         // Opcional (si es nulo, es contra la máquina)
  rivalCharacterId: number; // El personaje del rival
}