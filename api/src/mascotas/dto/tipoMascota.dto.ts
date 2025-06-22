import { IsString } from "class-validator";

export class TipoMascotaDto {



  @IsString()
  nombre: string;

}