import { IsUUID } from 'class-validator';

export class AssignDragonDto {
  @IsUUID()
  hunterId: string;
}
