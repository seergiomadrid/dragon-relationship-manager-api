import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EncountersService } from './encounters.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import { Role } from '@prisma/client';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@ApiBearerAuth('bearer')
@Controller('encounters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncountersController {
  constructor(private encounters: EncountersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HUNTER)
  create(@Body() dto: CreateEncounterDto, @CurrentUser() user: JwtPayload) {
    return this.encounters.createEncounter({
      dragonId: dto.dragonId,
      type: dto.type,
      outcome: dto.outcome,
      notes: dto.notes,
      performedById: user.sub,
      performedByRole: user.role,
    });
  }
}
