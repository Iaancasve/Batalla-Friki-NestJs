import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class StartBattleDto {
  @IsInt()
  @IsPositive()
  characterId: number; 

  @IsOptional()
  @IsInt()
  @IsPositive()
  rivalId?: number; 

  @IsInt()
  @IsPositive()
  rivalCharacterId: number; 
}