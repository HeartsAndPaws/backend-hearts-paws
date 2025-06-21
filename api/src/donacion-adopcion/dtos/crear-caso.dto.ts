import { IsEnum, IsNotEmpty, IsOptional, ValidateIf, IsNumber } from 'class-validator';

export enum TipoCaso {
  ADOPCION = 'ADOPCION',
  DONACION = 'DONACION',
}

export class CrearCasoDto {
  @IsNotEmpty()
  titulo: string;

  @IsNotEmpty()
  descripcion: string;

  @IsEnum(TipoCaso)
  tipo: TipoCaso;

  @IsNotEmpty()
  idMascota: string;

  @IsNotEmpty()
  idOng: string;

  @ValidateIf(o => o.tipo === TipoCaso.DONACION)
  @IsNumber()
  metaDonacion?: number;
}
