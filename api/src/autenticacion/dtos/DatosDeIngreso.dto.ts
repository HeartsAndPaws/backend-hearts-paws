import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength } from "class-validator";
import { Trim } from "src/autenticacion/decoradores/trim.decorator";
const xss = require('xss');

export class DatosDeIngresoDto{
    
    @ApiProperty({
    example: 'usuario@example.com',
    description: 'Correo electrónico del usuario. Solo se permite un "@" y letras, números, ".", "_" o "-"',
    maxLength: 60,
  })
  
    @IsEmail()
    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
    message: 'Solo se permite un "@" y letras, números, ".", "_" o "-"',
  })
    @Trim()
    @MaxLength(60)
    email: string;


    @ApiProperty({
    example: 'MiClaveSegura123',
    description: 'Contraseña del usuario (máx. 40 caracteres). Será sanitizada para evitar ataques XSS.',
    maxLength: 40,
  })
    @IsString()
    @MaxLength(40)
    @Transform(({ value }) => xss(value))
    contrasena: string;
}