import { IsString, IsOptional, IsUUID, IsEnum, IsInt, IsNumber } from 'class-validator'
import { EstadoAdopcion } from '@prisma/client';

export class SolicitudParaAdoptarDto {
  @IsUUID()
  usuarioId: string;

  @IsUUID()
  casoAdopcionId: string;

  @IsEnum(EstadoAdopcion)
  @IsOptional()
  estado?: EstadoAdopcion;

  @IsString()
  tipoVivienda: string;

  @IsInt()
  integrantesFlia: number;

  @IsInt()
  @IsOptional()
  hijos: number;

  @IsNumber()
  hayOtrasMascotas: number;

  @IsString()
  @IsOptional()
  descripcionOtrasMascotas?: string;

  @IsString()
  cubrirGastos: string;

  @IsString()
  darAlimentoCuidados: string;

  @IsString()
  darAmorTiempoEj: string;

  @IsString()
  devolucionDeMascota: string;

  @IsString()
  siNoPodesCuidarla: string;

  @IsString()
  declaracionFinal: string;
}