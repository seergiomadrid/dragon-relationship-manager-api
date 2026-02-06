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
    return this.dragons.findAll(user.sub, user.role);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateDragonDto) {
    return this.dragons.create(dto);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assign(@Param('id') dragonId: string, @Body() dto: AssignDragonDto) {
    return this.dragons.assignDragon(dragonId, dto.hunterId);
  }

  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.HUNTER)
  close(
    @Param('id') dragonId: string,
    @Body() dto: CloseDragonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dragons.closeDragon({
      dragonId,
      outcome: dto.outcome,
      notes: dto.notes,
      userId: user.sub,
      role: user.role,
    });
  }
}
