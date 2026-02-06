import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateDragonDto } from './dto/create-dragon.dto';

@Injectable()
export class DragonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return await this.prisma.dragon.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // HUNTER: solo dragones asignados
    return await this.prisma.dragon.findMany({
      where: { ownerHunterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateDragonDto) {
    return await this.prisma.dragon.create({
      data: {
        name: dto.name,
        speciesType: dto.speciesType,
        aggression: dto.aggression ?? 30,
        // state se queda por default ASSIGNED
        // ownerHunterId null por default (sin asignar)
      },
    });
  }
}
