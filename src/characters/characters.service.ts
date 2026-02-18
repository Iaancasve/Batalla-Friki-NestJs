import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CharactersService {

  constructor(private prisma: PrismaService) { }

  create(createCharacterDto: CreateCharacterDto) {
    return 'This action adds a new character';
  }

  findAll() {
    return this.prisma.character.findMany();
  }

  async findOne(id: number) {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException(`Personaje con ID ${id} no encontrado`);
    }

    return character;
  }

  update(id: number, updateCharacterDto: UpdateCharacterDto) {
    return `This action updates a #${id} character`;
  }

  remove(id: number) {
    return `This action removes a #${id} character`;
  }

  async attack(attackerId: number, targetId: number) {
    const attacker = await this.findOne(attackerId);
    const target = await this.findOne(targetId);

    const newHp = Math.max(0, target.hp - attacker.attack);

    return this.prisma.character.update({
      where: { id: targetId },
      data: { hp: newHp },
    });
  }
}
