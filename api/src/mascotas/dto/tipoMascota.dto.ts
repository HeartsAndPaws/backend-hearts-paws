import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TipoMascotaDto {


  @ApiProperty({ description: 'Nombre del tipo de mascota', example: 'Perro' })
  @IsString()
  nombre: string;

}