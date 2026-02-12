import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Param,
} from '@nestjs/common';
import { DragonsService } from './dragons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateDragonDto } from './dto/create-dragon.dto';
import { AssignDragonDto } from './dto/assign-dragon.dto';
import { CloseDragonDto } from './dto/close-dragon.dto';

@ApiBearerAuth('bearer')
@Controller('dragons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DragonsController {
  constructor(private dragons: DragonsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.HUNTER)
  async getAll(@CurrentUser() user: JwtPayload) {
    return await this.dragons.findAll(user.sub, user.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HUNTER)
  async getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return await this.dragons.findById(id, user.sub, user.role);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateDragonDto) {
    return await this.dragons.create(dto);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  async assign(@Param('id') dragonId: string, @Body() dto: AssignDragonDto) {
    return await this.dragons.assignDragon(dragonId, dto.hunterId);
  }

  @Get(':id/encounters')
  @Roles(Role.ADMIN, Role.HUNTER)
  async getEncounters(
    @Param('id') dragonId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.dragons.getEncountersForDragon({
      dragonId,
      userId: user.sub,
      role: user.role,
    });
  }

  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.HUNTER)
  async close(
    @Param('id') dragonId: string,
    @Body() dto: CloseDragonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.dragons.closeDragon({
      dragonId,
      outcome: dto.outcome,
      notes: dto.notes,
      userId: user.sub,
      role: user.role,
    });
  }
}
