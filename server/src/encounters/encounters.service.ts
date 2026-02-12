import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DragonState,
  EncounterOutcome,
  EncounterType,
  Role,
} from '@prisma/client';

function deltaFromType(type: EncounterType): number {
  switch (type) {
    case 'NEGOTIATION':
      return -10;
    case 'BRIBE':
      return -20;
    case 'COMBAT':
      return +15;
    case 'OBSERVATION':
    default:
      return 0;
  }
}

function clampAggression(v: number): number {
  if (v < 0) return 0;
  if (v > 100) return 100;
  return v;
}

@Injectable()
export class EncountersService {
  constructor(private prisma: PrismaService) {}

  async createEncounter(params: {
    dragonId: string;
    performedById: string;
    performedByRole: Role;
    type: EncounterType;
    outcome?: EncounterOutcome;
    notes?: string;
  }) {
    const dragon = await this.prisma.dragon.findUnique({
      where: { id: params.dragonId },
      select: {
        id: true,
        aggression: true,
        state: true,
        ownerHunterId: true,
      },
    });

    if (!dragon) throw new NotFoundException('Dragon not found');
    if (dragon.state === 'CLOSED')
      throw new ForbiddenException('Dragon is closed');

    if (
      params.performedByRole === Role.HUNTER &&
      dragon.ownerHunterId !== params.performedById
    ) {
      throw new ForbiddenException('You do not own this dragon');
    }

    const delta = deltaFromType(params.type);
    const newAggression = clampAggression(dragon.aggression + delta);

    const baseState: DragonState = dragon.ownerHunterId
      ? 'IN_PROGRESS'
      : 'ASSIGNED';
    const newState: DragonState = newAggression >= 70 ? 'AT_RISK' : baseState;

    return this.prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          dragonId: dragon.id,
          performedById: params.performedById,
          type: params.type,
          outcome: params.outcome ?? 'NEUTRAL',
          notes: params.notes,
          aggressionDelta: delta,
        },
      });

      const updatedDragon = await tx.dragon.update({
        where: { id: dragon.id },
        data: {
          aggression: newAggression,
          state: newState,
          lastEncounterAt: new Date(),
        },
      });

      return { encounter, updatedDragon };
    });
  }
}
