import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EstadoAdopcion } from '@prisma/client';

export class CambiarEstadoDto {
  @IsNotEmpty()
  @IsUUID()
  idDelCasoAdopcion: string

  @IsNotEmpty()
  @IsUUID()
  idDeSolicitudAceptada: string

  @IsEnum(EstadoAdopcion)
  estadoNuevo: EstadoAdopcion
}
