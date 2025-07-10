import { IsString, IsOptional, IsUUID, IsEnum, IsInt, IsNumber } from 'class-validator'
import { EstadoAdopcion } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitudParaAdoptarDto {

  @ApiProperty({
    description: 'ID del caso de adopción al que se aplica',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  casoAdopcionId: string;

  @ApiProperty({
    description: 'Estado actual de la solicitud de adopción',
    enum: EstadoAdopcion,
    required: false,
    example: EstadoAdopcion.PENDIENTE
  })
  @IsEnum(EstadoAdopcion)
  @IsOptional()
  estado?: EstadoAdopcion;

  @ApiProperty({
    description: 'Tipo de vivienda donde reside el solicitante (casa, apartamento, etc.)',
    example: 'casa'
  })
  @IsString()
  tipoVivienda: string;

  @ApiProperty({
    description: 'Cantidad total de integrantes en la familia',
    example: 4
  })
  @IsInt()
  integrantesFlia: number;

  @ApiProperty({
    description: 'Cantidad de hijos en la familia',
    example: 2,
    required: false
  })
  @IsInt()
  @IsOptional()
  hijos: number;

  @ApiProperty({
    description: 'Cantidad de otras mascotas presentes en el hogar',
    example: 1
  })
  @IsNumber()
  hayOtrasMascotas: number;

  @ApiProperty({
    description: 'Descripción breve de otras mascotas (si existen)',
    example: 'Un perro y un gato',
    required: false
  })
  @IsString()
  @IsOptional()
  descripcionOtrasMascotas?: string;

  @ApiProperty({
    description: '¿El solicitante puede cubrir los gastos de la mascota?',
    example: 'Sí'
  })
  @IsString()
  cubrirGastos: string;

  @ApiProperty({
    description: 'Frecuencia y tipo de alimentación y cuidados que proporcionará',
    example: 'Comida dos veces al día y paseos diarios'
  })
  @IsString()
  darAlimentoCuidados: string;

  @ApiProperty({
    description: 'Cantidad de tiempo y dedicación que dará a la mascota para amor y ejercicio',
    example: '2 horas al día de juego y paseo'
  })
  @IsString()
  darAmorTiempoEj: string;

  @ApiProperty({
    description: '¿Qué haría en caso de tener que devolver la mascota?',
    example: 'Buscaría una nueva familia responsable'
  })
  @IsString()
  devolucionDeMascota: string;

  @ApiProperty({
    description: 'Acción que tomaría si no puede cuidar más de la mascota',
    example: 'Contactaría a la organización para ayuda'
  })
  @IsString()
  siNoPodesCuidarla: string;

  @ApiProperty({
    description: 'Declaración final de compromiso por parte del solicitante',
    example: 'Me comprometo totalmente a cuidar de la mascota'
  })
  @IsString()
  declaracionFinal: string;
}
