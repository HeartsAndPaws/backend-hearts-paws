import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateMascotaDto {

  @ApiProperty({ description: 'Nombre de la mascota', example: 'Firulais' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Edad de la mascota en años aproximados', example: 2 })
  @IsNumber()
  @Min(0)
  edad: number;

  @ApiProperty({ description: 'Descripción de la mascota', example: 'Perro amigable' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'ID del tipo de mascota'})
  @IsUUID()
  @IsNotEmpty()
  tipoId: string;
}