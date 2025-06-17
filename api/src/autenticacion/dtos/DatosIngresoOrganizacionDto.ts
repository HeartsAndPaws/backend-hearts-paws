import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { Trim } from "src/autenticacion/decoradores/trim.decorator";
const xss = require('xss');

export class DatosIngresoOrganizacionDto{
    @IsEmail()
    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
    message: 'Solo se permite un "@" y letras, números, ".", "_" o "-"',
  })

    @Trim()
    @MaxLength(60)
    email: string;

    @IsString()
    @MaxLength(40)
    @Transform(({ value }) => xss(value))
    contrasena: string;
}