import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DragonOutcome, Role } from '@prisma/client';
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
  async findById(id: string, userId: string, role: Role) {
    const dragon = await this.prisma.dragon.findUnique({ where: { id } });
    if (!dragon) throw new NotFoundException('Dragon not found');
    if (role === Role.HUNTER && dragon.ownerHunterId !== userId) {
      throw new ForbiddenException('You cannot access this dragon dossier');
    }
    return dragon;
  }

  async getEncountersForDragon(params: {
    dragonId: string;
    userId: string;
    role: Role;
  }) {
    const { dragonId, userId, role } = params;

    const dragon = await this.prisma.dragon.findUnique({
      where: { id: dragonId },
      select: { id: true, ownerHunterId: true },
    });

    if (!dragon) throw new NotFoundException('Dragon not found');

    if (role === Role.HUNTER && dragon.ownerHunterId !== userId) {
      throw new ForbiddenException('You cannot access this dragon dossier');
    }

    return this.prisma.encounter.findMany({
      where: { dragonId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dragonId: true,
        performedById: true,
        type: true,
        outcome: true,
        aggressionDelta: true,
        notes: true,
        createdAt: true,
      },
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

  async assignDragon(dragonId: string, hunterId: string) {
    return await this.prisma.dragon.update({
      where: { id: dragonId },
      data: {
        ownerHunterId: hunterId,
        state: 'IN_PROGRESS',
        // lastEncounterAt: NO aquí
      },
    });
  }

  async closeDragon(params: {
    dragonId: string;
    userId: string;
    role: Role;
    outcome: DragonOutcome;
    notes?: string;
  }) {
    const dragon = await this.prisma.dragon.findUnique({
      where: { id: params.dragonId },
    });

    if (!dragon) throw new NotFoundException('Dragon not found');
    if (dragon.state === 'CLOSED')
      throw new ForbiddenException('Already closed');

    if (params.role === Role.HUNTER && dragon.ownerHunterId !== params.userId) {
      throw new ForbiddenException('Not your dragon');
    }

    return this.prisma.dragon.update({
      where: { id: dragon.id },
      data: {
        state: 'CLOSED',
        outcome: params.outcome,
        outcomeNotes: params.notes,
        closedAt: new Date(),
      },
    });
  }
}
