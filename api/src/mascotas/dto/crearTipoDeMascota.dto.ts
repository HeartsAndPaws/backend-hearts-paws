import { IsNotEmpty, IsString } from "class-validator";

export class CrearTipoDeMascotaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
