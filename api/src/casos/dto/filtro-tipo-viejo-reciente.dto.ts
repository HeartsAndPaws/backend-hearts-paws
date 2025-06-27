import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { FiltroViejoRecienteEnum, TipoMascotaEnum } from '../enums/filtro-tipo-reciente-antiguo.enum';

export class FiltrarPorTipoViejoRecienteDto {
  @IsUUID()
  @IsNotEmpty()
  ongId: string

  @IsOptional()
  @IsEnum(FiltroViejoRecienteEnum)
  viejoReciente?: FiltroViejoRecienteEnum

  @IsOptional()
  @IsEnum(TipoMascotaEnum)
  tipoMascota?: TipoMascotaEnum
}