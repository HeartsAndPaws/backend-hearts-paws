// src/caso/dto/filtrar-casos.dto.ts
import { IsOptional, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { TipoCaso } from '@prisma/client';

export class FiltrarPorCasosFechasDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(TipoCaso)
  tipo: TipoCaso;

  @IsNotEmpty()
  @IsOptional()
  @IsDateString()
  fechaDesde: string;

  @IsNotEmpty()
  @IsOptional()
  @IsDateString()
  fechaHasta: string;
}