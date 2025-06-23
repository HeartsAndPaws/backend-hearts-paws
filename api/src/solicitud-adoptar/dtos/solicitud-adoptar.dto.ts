import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator'
import { EstadoAdopcion } from '@prisma/client';

export class SolicitudParaAdoptarDto {
  @IsUUID()
  usuarioId: string;

  @IsUUID()
  casoId: string;

  @IsEnum(EstadoAdopcion)
  @IsOptional() // ya que tiene valor por defecto en el modelo
  estado?: EstadoAdopcion;

  @IsString()
  tipoVivienda: string;

  @IsString()
  conQuienVives: string;

  @IsString()
  @IsOptional()
  hijos?: string;

  @IsString()
  @IsOptional()
  otros?: string;

  @IsString()
  hayOtrasMascotas: string;

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