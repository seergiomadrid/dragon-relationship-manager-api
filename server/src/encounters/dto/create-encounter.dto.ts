import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EncounterType, EncounterOutcome } from '@prisma/client';

export class CreateEncounterDto {
  @IsUUID()
  dragonId: string;

  @IsEnum(EncounterType)
  type: EncounterType;

  @IsOptional()
  @IsEnum(EncounterOutcome)
  outcome?: EncounterOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
