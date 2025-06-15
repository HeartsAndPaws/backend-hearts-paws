import { IsEmail, IsString, IsStrongPassword, IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";
import { Transform } from "class-transformer";
const xss = require('xss');
import { Trim } from "src/decoradores/trim.decorator";

export class NuevoUsuarioDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-zÀ-ÿ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    @Transform(({ value }) => xss(value))
    @MaxLength(50)
    nombre: string;

    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, {
    message: 'Email: solo se permite un "@" y letras, números, ".", "_" o "-"',
  })
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

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => xss(value))
    @Trim()
    @Transform(({ value }) => value.replace(/\D/g, ''))
    @MaxLength(20)
    telefono: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9.,_\-\s]+$/, {
    message: 'Dirección: solo se permiten letras, números, espacios, puntos, comas, guiones medios, guiones bajos.',
})


    @MaxLength(70)
    direccion: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-z0-9 ]+$/, {
    message: 'Ciudad:Solo se permiten letras, números y espacios',
})

    @MaxLength(25)
    ciudad: string;

    @IsNotEmpty()
    @MaxLength(25)
    @IsString()
    @Matches(/^[a-zA-Z0-9]+$/, {
      message: 'Pais: solo se permiten letras y números',
})
    pais: string;
}