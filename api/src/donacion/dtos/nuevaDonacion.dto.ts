import { IsNotEmpty, IsUUID, IsOptional, IsNumber, Min, IsString, IsUrl } from "class-validator";

export class NuevaDonacionDto {
  @IsUUID()
  @IsNotEmpty()
  @IsNotEmpty()
  usuarioId: string;

  @IsUUID()
  @IsNotEmpty()
  organizacionId: string;

  @IsUUID()
  @IsNotEmpty()
  mascotaId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  monto: number;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  comprobante: string;
}
