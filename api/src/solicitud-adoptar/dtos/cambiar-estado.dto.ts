import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EstadoAdopcion } from '@prisma/client';

export class CambiarEstadoDto {
  @IsNotEmpty()
  @IsUUID()
  id: string

  @IsEnum(EstadoAdopcion)
  estadoNuevo: EstadoAdopcion
}
