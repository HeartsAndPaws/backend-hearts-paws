import { IsString, IsEnum, IsNotEmpty, IsOptional, IsNumber, ValidateNested, IsArray, ArrayMaxSize } from "class-validator";
import { Type } from "class-transformer";

export enum TipoCaso {
  ADOPCION = "ADOPCION",
  DONACION = "DONACION",
}

export class AdopcionDataDto {
  @IsEnum(["PENDIENTE", "ACEPTADA", "RECHAZADA"])
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
}

export class DonacionDataDto {
  @IsNumber()
  metaDonacion: number;

}

export class CreateCasoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(TipoCaso)
  tipo: TipoCaso;

  @IsString()
  @IsNotEmpty()
  mascotaId: string;

  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsOptional()
  imagenes: string[]

  @IsString()
  @IsNotEmpty()
  ongId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdopcionDataDto)
  adopcion?: AdopcionDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DonacionDataDto)
  donacion?: DonacionDataDto;
}
