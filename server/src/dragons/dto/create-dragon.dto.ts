import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDragonDto {
  @IsString()
  name: string;

  @IsString()
  speciesType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aggression?: number; // 0..100
}
