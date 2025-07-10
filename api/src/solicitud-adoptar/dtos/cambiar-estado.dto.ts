import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EstadoAdopcion } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoDto {

  @ApiProperty({ description: 'ID del caso de adopción', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  idDelCasoAdopcion: string

  @ApiProperty({ description: 'ID de la solicitud de adopción aceptada', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsNotEmpty()
  @IsUUID()
  idDeSolicitudAceptada: string

  @ApiProperty({ description: 'Nuevo estado de la solicitud de adopción', enum: EstadoAdopcion, example: EstadoAdopcion.ACEPTADA })
  @IsEnum(EstadoAdopcion)
  estadoNuevo: EstadoAdopcion
}
