// src/caso/dto/filtrar-casos.dto.ts
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TipoCaso } from '@prisma/client';

export class FiltrarPorCasosFechasDto {
  @IsOptional()
  @IsEnum(TipoCaso)
  tipo?: TipoCaso;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}