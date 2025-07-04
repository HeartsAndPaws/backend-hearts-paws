import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { CambiarEstadoDto } from './dtos/cambiar-estado.dto';
import { filtroViviendaQdeMascotasDto } from './dtos/filtroViviendaQdeMascotas.dto';
import { EstadoAdopcion } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Solicitudes de Adopción')
@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva solicitud de adopción' })
  @ApiBody({
    type: SolicitudParaAdoptarDto,
    examples: {
      ejemplo: {
        value: {
          usuarioId: 'b2222e9c-22f4-47e1-8fa7-9eabc12def01',
          casoAdopcionId: 'd3333e9c-11e2-4e5f-baf2-8b1234cde567',
          tipoVivienda: 'Apartamento',
          integrantesFlia: 3,
          hijos: 1,
          hayOtrasMascotas: 1,
          descripcionOtrasMascotas: 'Un perro mestizo',
          cubrirGastos: 'Sí',
          darAlimentoCuidados: 'Sí, compro alimento premium',
          darAmorTiempoEj: 'Salimos al parque todos los días',
          devolucionDeMascota: 'Solo si hay una emergencia',
          siNoPodesCuidarla: 'Buscaría ayuda con un familiar',
          declaracionFinal: 'Estoy seguro de mi decisión'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Solicitud creada correctamente' })
  create(@Body() createSolicitudAdoptarDto: SolicitudParaAdoptarDto) {
    return this.solicitudAdoptarService.crearSolicitud(createSolicitudAdoptarDto);
  }

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Ver todas las solicitudes, opcionalmente filtradas por estado' })
  @ApiQuery({
    name: 'estado',
    enum: EstadoAdopcion,
    required: false,
    description: 'Filtrar por estado de adopción'
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes de adopción' })
  async verTodasLasSolicitudes(@Query('estado') estado: EstadoAdopcion) {
    return this.solicitudAdoptarService.verCasosAdopcionPorEstado(estado)
  }

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get('aceptadas/total')
  @ApiOperation({ summary: 'Contar el total de solicitudes aceptadas' })
  @ApiResponse({ status: 200, description: 'Cantidad de adopciones aceptadas', schema: { example: { total: 8 } } })
  async contarAceptadas() {
    return await this.solicitudAdoptarService.contarAdopcionesAceptadas();
  }

  @Get('solicitudesDeCadaAdopcion/:id')
  @ApiOperation({ summary: 'Ver solicitudes para un caso de adopción' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del caso de adopción' })
  @ApiResponse({ status: 200, description: 'Solicitudes asociadas a un caso de adopción' })
  verSolicitudesPorCaso(@Param('id') id: string) {
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(id)
  }

  @Get('filtro')
  @ApiOperation({ summary: 'Filtrar solicitudes por vivienda y tipo de mascota' })
  @ApiBody({
    type: filtroViviendaQdeMascotasDto,
    examples: {
      ejemplo: {
        value: {
          casoAdopcionId: 'a1b2c3d4-5678-9101-1121-314151617181',
          tipoVivienda: 'Casa'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Lista filtrada de solicitudes' })
  filtrarSolicitudes(@Body() filtro: filtroViviendaQdeMascotasDto) {
    const { casoAdopcionId, tipoVivienda } = filtro
    return this.solicitudAdoptarService.filtroViviendaQdeMascotas(casoAdopcionId, tipoVivienda);
  }

  @Patch()
  @ApiOperation({ summary: 'Aceptar o cambiar el estado de una solicitud de adopción' })
  @ApiBody({
    type: CambiarEstadoDto,
    examples: {
      ejemplo: {
        value: {
          idDelCasoAdopcion: 'd3333e9c-11e2-4e5f-baf2-8b1234cde567',
          idDeSolicitudAceptada: 'a2222e9c-22f4-47e1-8fa7-9eabc12def01',
          estadoNuevo: 'ACEPTADA'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Solicitud actualizada correctamente' })
  async aceptarSolicitud(@Body() datos: CambiarEstadoDto) {
    const { idDelCasoAdopcion, idDeSolicitudAceptada, estadoNuevo } = datos;
    return this.solicitudAdoptarService.aceptarSolicitud(
      idDelCasoAdopcion,
      idDeSolicitudAceptada,
      estadoNuevo,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar una solicitud de adopción' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada correctamente' })
  borrarSolicitud(@Param('id') id: string) {
    return this.solicitudAdoptarService.borrarSolicitud(id);
  }
}
