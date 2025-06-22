import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";
import { Trim } from "src/autenticacion/decoradores/trim.decorator";
const xss = require('xss')

export class CreateOrganizacioneDto {
  @ApiPropertyOptional({
    example: 'Refugio Animal Esperanza',
    description: 'Nombre completo de la organización.',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  @Transform(({ value }) => xss(value))
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 'contacto@refugioesperanza.org',
    description: 'Correo electrónico de la organización.',
    maxLength: 60,
  })
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
  message: 'Email: solo se permite un "@" y letras, números, ".", "_" o "-"',})
  @Transform(({ value }) => value.toLowerCase())
  @MaxLength(60)
  email: string;

  @ApiPropertyOptional({
    example: 'ClaveSegura#2024',
    description: 'Contraseña segura de la organización. Debe tener al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.',
    minLength: 8,
    maxLength: 40,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  @IsNotEmpty()
  @Transform(({ value }) => xss(value))
  @IsStrongPassword({
    minUppercase:1,
    minLowercase:1,
    minNumbers:1,
    minSymbols:1
  })
  contrasena: string;

  @ApiPropertyOptional({
    example: 'Rescatamos y damos en adopción animales abandonados.',
    description: 'Breve descripción de la organización.',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;


  @ApiPropertyOptional({
    example: '3114567890',
    description: 'Número de teléfono de la organización.',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => xss(value))
  @Trim()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @MaxLength(20)
  telefono: string;


  @ApiPropertyOptional({
    example: 'Calle 45 #67-89',
    description: 'Dirección física de la organización.',
    maxLength: 70,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  direccion: string;

  @ApiPropertyOptional({
    example: 'Bogotá',
    description: 'Ciudad donde opera la organización.',
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  ciudad: string;

  @ApiPropertyOptional({
    example: 'Colombia',
    description: 'País de la organización.',
  })
  @IsString()
  @IsNotEmpty()
  pais: string;
}
