export class CreateCharacterDto {
  name: string;
  hp: number;
  baseHp: number;
  attack: number;
  levelRequired?: number; 
}