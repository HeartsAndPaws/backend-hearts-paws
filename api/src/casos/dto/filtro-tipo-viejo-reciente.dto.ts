import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { FiltroViejoRecienteEnum, TipoMascotaEnum } from '../enums/filtro-tipo-reciente-antiguo.enum';

export class FiltrarPorTipoViejoRecienteDto {
  @IsUUID()
  @IsNotEmpty()
  ongId: string

  @IsNotEmpty()
  @IsEnum(FiltroViejoRecienteEnum)
  viejoReciente: FiltroViejoRecienteEnum

  @IsNotEmpty()
  @IsEnum(TipoMascotaEnum)
  tipoMascota: TipoMascotaEnum
}