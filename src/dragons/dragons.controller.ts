import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DragonsService } from './dragons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateDragonDto } from './dto/create-dragon.dto';

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
}
