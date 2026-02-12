import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(24)
  displayName: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @IsEnum(Role)
  role: Role;
}
