import { IsEmail, IsString } from "class-validator";

export class DatosDeIngresoDto{
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    password: string;
}