import { Controller,Get, Post, Body, Param, UseInterceptors, UploadedFiles, UseGuards} from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { TipoMascotaDto } from './dto/tipoMascota.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';

@ApiTags('Mascotas')
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todas las mascotas' })
  @ApiResponse({ status: 200, description: 'Lista de todas las mascotas.' })
  @Get()
  GetMascotas() {
    return this.mascotasService.GetMascotas();
  }

  @ApiOperation({ summary: 'Obtener mascotas en adopción por ONG' })
  @ApiParam({ name: 'ongId', required: true, example: '7f83a2d5-9f14-40ae-a8b6-fde39cfb0032', description: 'ID de la ONG' })
  @ApiResponse({ status: 200, description: 'Lista de mascotas en adopción asociadas a la ONG.' })
  @Get('mascotas-por-ong-adopcion/:ongId')
  listaDeMascotasEnAdopcionPorOng(@Param('ongId') ongId: string) {
    return this.mascotasService.mascotasEnAdopcionPorOng(ongId);
  }

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Contar el total de mascotas' })
  @ApiResponse({ status: 200, description: 'Total de mascotas.' })
  @Get('total')
  async contarTotalMascotas() {
    return await this.mascotasService.contarMascotas();
  }

  @ApiOperation({ summary: 'Obtener todos los tipos de mascotas' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de mascotas.' })
  @Get('tipo')
  GetTiposMascotas() {
    return this.mascotasService.GetTipo();
  }

  @ApiOperation({ summary: 'Obtener una mascota por ID' })
  @ApiParam({ name: 'id', required: true, example: 'b6985ee8-9802-497c-97b4-1a43843a3c1f', description: 'ID de la mascota' })
  @ApiResponse({ status: 200, description: 'Datos de la mascota encontrada.' })
  @Get(':id')
  GetMascotaById(@Param('id') id: string) {
    return this.mascotasService.GetMascotaById(id);
  }

  @ApiOperation({ summary: 'Obtener mascotas de una ONG por su ID' })
  @ApiParam({ name: 'id', required: true, example: '7f83a2d5-9f14-40ae-a8b6-fde39cfb0032', description: 'ID de la ONG' })
  @ApiResponse({ status: 200, description: 'Mascotas asociadas a la ONG.' })
  @Get('ong/:id')
  GetMascotasByOngId(@Param('id') ongId: string) {
    return this.mascotasService.GetMascotasByOngId(ongId);
  }

  @ApiOperation({ summary: 'Crear un tipo de mascota (vía /crearTipo)' })
  @ApiResponse({ status: 201, description: 'Tipo de mascota creado correctamente.' })
  @ApiBody({
    type: TipoMascotaDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo',
        value: {
          nombre: 'Perro'
        }
      }
    }
  })
  @Post('crearTipo')
  CreateTipoMascota(@Body() createTipoMascotaDto: TipoMascotaDto) {
    return this.mascotasService.CreateTipoMascota(createTipoMascotaDto);
  }

  @ApiOperation({ summary: 'Crear una nueva mascota' })
  @ApiResponse({ status: 201, description: 'Mascota creada correctamente.' })
  @ApiBody({
    type: CreateMascotaDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo',
        value: {
          nombre: 'Rocky',
          edad: 2,
          descripcion: 'Perro enérgico y sociable',
          organizacionId: '7f83a2d5-9f14-40ae-a8b6-fde39cfb0032',
          tipoId: 'b6385ee8-1111-2222-3333-1a43843a3c1f'
        }
      }
    }
  })
  @Post()
  CreateMascota(@Body() createMascotaDto: CreateMascotaDto) {
    return this.mascotasService.CreateMascota(createMascotaDto);
  }

  @ApiOperation({ summary: 'Crear un tipo de mascota (vía /tipo)' })
  @ApiResponse({ status: 201, description: 'Tipo de mascota creado correctamente.' })
  @ApiBody({
    type: TipoMascotaDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo',
        value: {
          nombre: 'Gato'
        }
      }
    }
  })
  @Post('tipo')
  crearTipoDeMascota(@Body() datos: TipoMascotaDto) {
    const { nombre } = datos;
    return this.mascotasService.crearTipoDeMascota(nombre);
  }

  @ApiOperation({ summary: 'Subir imágenes para una mascota' })
  @ApiParam({ name: 'id', required: true, example: 'b6985ee8-9802-497c-97b4-1a43843a3c1f', description: 'ID de la mascota' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imagenes: {
          type: 'array',
          items: { type: 'string', format: 'binary' }
        }
      }
    },
    examples: {
      ejemplo: {
        summary: 'Ejemplo de subida de imágenes',
        value: {
          imagenes: ['(binary file)', '(binary file)']
        }
      }
    }
  })
  @Post(':id/imagenes')
  @UseInterceptors(FilesInterceptor('imagenes'))
  async subirImagenes(
    @Param('id') mascotaId: string,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    return this.mascotasService.SubirImagenes(mascotaId, archivos);
  }
}
