import { IsString, IsEnum, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export enum TipoCaso {
  ADOPCION = "ADOPCION",
  DONACION = "DONACION",
}

export class AdopcionDataDto {
  @ApiProperty({ description: 'Estado de la solicitud de Adopcion', example: 'ACEPTADA' })
  @IsEnum(["PENDIENTE", "ACEPTADA", "RECHAZADA"])
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
}

export class DonacionDataDto {
  @ApiProperty({ description: 'Cantidad de la meta de donación', example: 310000 })
  @IsNumber() 
  metaDonacion: number;

}

export class CreateCasoDto {

  @ApiProperty({ description: 'Título del caso', example: 'Caso de adopción urgente' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Descripción del caso', example: 'Este es un caso urgente de adopción' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Tipo de caso', enum: TipoCaso, example: TipoCaso.ADOPCION })
  @IsEnum(TipoCaso)
  tipo: TipoCaso;

  @ApiProperty({ description: 'ID de la mascota asociada al caso', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  mascotaId: string;

  @ApiProperty({ description: 'ID del detalle de adopcion (si es el caso)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdopcionDataDto)
  adopcion?: AdopcionDataDto;

  @ApiProperty({ description: 'Id del detalle de donación (si es el caso)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DonacionDataDto)
  donacion?: DonacionDataDto;
}
