import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Para dev/MVP: permitimos elegir rol.
  // En producción normalmente esto lo decide ADMIN.
  @IsEnum(Role)
  role: Role;
}
