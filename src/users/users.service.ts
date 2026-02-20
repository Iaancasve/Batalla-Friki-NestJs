import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        level: 1,
        xp: 0,
        wins: 0,
        losses: 0,
        roles: {
          create: [
            {
              role: {
                connect: { name: 'USER' }
              }
            }
          ]
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true 
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}