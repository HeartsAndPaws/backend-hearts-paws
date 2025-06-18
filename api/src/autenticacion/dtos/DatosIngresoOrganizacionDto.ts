import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { Trim } from "src/autenticacion/decoradores/trim.decorator";
const xss = require('xss');

export class DatosIngresoOrganizacionDto{

    @ApiProperty({
    example: 'contacto@refugioanimal.org',
    description: 'Correo electrónico de la organización. Solo se permite un "@" y letras, números, ".", "_" o "-".',
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
    example: 'OrgSecurePass456',
    description: 'Contraseña para la organización. Se sanitiza para prevenir ataques XSS.',
    maxLength: 40,
  })
    @IsString()
    @MaxLength(40)
    @Transform(({ value }) => xss(value))
    contrasena: string;
}