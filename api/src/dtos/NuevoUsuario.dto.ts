import { IsEmail, IsNumber, IsString } from "class-validator";

export class NuevoUsuarioDto {
    @IsString()
    nombre: string;

    @IsEmail()
    email: string;

    password: string;

    confirmPassword: string;

    @IsString()
    telefono: string;

    @IsString()
    direccion: string;

    @IsString()
    ciudad: string;

    @IsString()
    pais: string;
}