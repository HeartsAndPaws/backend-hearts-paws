import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";
const xss = require('xss');
import { Trim } from "src/autenticacion/decoradores/trim.decorator";

export class NuevaOrganizacionDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-zÀ-ÿ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    @Transform(({ value }) => xss(value))
    @MaxLength(50)
    nombre: string;

    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
    message: 'Email: solo se permite un "@" y letras, números, ".", "_" o "-"',})

    @Trim()
    @Transform(({ value }) => value.toLowerCase())
    @MaxLength(60)
    email: string;

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

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => xss(value))
    @Trim()
    @Transform(({ value }) => value.replace(/\D/g, ''))
    @MaxLength(20)
    telefono: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(70)
    direccion: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    ciudad: string;

    @IsString()
    @IsNotEmpty()
    pais: string;
}
