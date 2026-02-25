import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '../../generated/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  lastName: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(8, 20, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString({ message: 'El rol debe ser válido' })
  role: Role;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'El ID de registro previo debe ser un número',
    },
  )
  preRegId?: number;
}
