import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class filtroViviendaQdeMascotasDto {
    @IsNotEmpty()
    @IsUUID()
    casoAdopcionId: string

    @IsOptional()
    @IsString()
    tipoVivienda?: string

    @IsOptional()
    @IsNumber()
    hayOtrasMascotas?:number
}