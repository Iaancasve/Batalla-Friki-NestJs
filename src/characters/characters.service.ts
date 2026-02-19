import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CharactersService {

  constructor(private prisma: PrismaService) { }

  create(createCharacterDto: CreateCharacterDto) {
    return this.prisma.character.create({
      data: createCharacterDto,
    });
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
    return this.prisma.character.update({
      where: { id },
      data: updateCharacterDto,
    });
  }

  remove(id: number) {
    return this.prisma.character.delete({
      where: { id },
    });
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

  async resetAll() {
    // Obtenemos todos los personajes para saber su baseHp original
    const characters = await this.prisma.character.findMany();

    const updates = characters.map((char) =>
      this.prisma.character.update({
        where: { id: char.id },
        data: { hp: char.baseHp },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
