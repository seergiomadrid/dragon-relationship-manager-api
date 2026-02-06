import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DragonOutcome } from '@prisma/client';

export class CloseDragonDto {
  @IsEnum(DragonOutcome)
  outcome: DragonOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
