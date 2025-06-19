import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";
const xss = require('xss');
import { Trim } from "src/autenticacion/decoradores/trim.decorator";

export class NuevaOrganizacionDto {

    @ApiProperty({
    example: 'Refugio Animal Esperanza',
    description: 'Nombre de la organización. Solo puede contener letras y espacios.',
    maxLength: 50,
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-zÀ-ÿ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    @Transform(({ value }) => xss(value))
    @MaxLength(50)
    nombre: string;


    @ApiProperty({
    example: 'contacto@refugioesperanza.org',
    description: 'Correo electrónico de la organización. Solo se permite un "@" y letras, números, ".", "_" o "-".',
    maxLength: 60,
    })
    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
    message: 'Email: solo se permite un "@" y letras, números, ".", "_" o "-"',})

    @Trim()
    @Transform(({ value }) => value.toLowerCase())
    @MaxLength(60)
    email: string;


    @ApiProperty({
    example: 'OrgSecure#2024',
    description:
    'Contraseña segura de la organización. Debe tener al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.',
    minLength: 8,
    maxLength: 40,
    })
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => xss(value))
    @MinLength(8)
    @MaxLength(40)
    @IsStrongPassword({
        minUppercase:1,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1
    })
    contrasena: string;


    @ApiProperty({
    example: 'Nos dedicamos a rescatar, cuidar y dar en adopción a animales abandonados.',
    description: 'Breve descripción de la misión de la organización.',
    })
    @IsString()
    @IsNotEmpty()
    descripcion: string;


    
    @ApiProperty({
    example: '3204567890',
    description: 'Número de teléfono de contacto (solo dígitos, sin espacios ni símbolos).',
    maxLength: 20,
    })
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => xss(value))
    @Trim()
    @Transform(({ value }) => value.replace(/\D/g, ''))
    @MaxLength(20)
    telefono: string;


    @ApiProperty({
    example: 'Carrera 45 #67-89, Barrio Los Pinos',
    description: 'Dirección física de la organización.',
    maxLength: 70,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(70)
    direccion: string;


    @ApiProperty({
    example: 'Bogotá',
    description: 'Ciudad donde está ubicada la organización.',
    maxLength: 25,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    ciudad: string;


    @ApiProperty({
    example: 'Colombia',
    description: 'País donde opera la organización.',
    })
    @IsString()
    @IsNotEmpty()
    pais: string;
}
