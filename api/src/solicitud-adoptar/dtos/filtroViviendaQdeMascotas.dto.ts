import { IsEnum, IsOptional, IsString } from "class-validator";

export class filtroViviendaQdeMascotasDto {
    @IsOptional()
    @IsString()
    tipoVivienda?: string

    @IsOptional()
    @IsString()
    hayOtrasMascotas?:string
}