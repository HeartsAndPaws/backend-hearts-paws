import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { CambiarEstadoDto } from './dtos/cambiar-estado.dto';
import { filtroViviendaQdeMascotasDto } from './dtos/filtroViviendaQdeMascotas.dto';
import { EstadoAdopcion } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';

@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}


  @Post()
  create(@Body() createSolicitudAdoptarDto: SolicitudParaAdoptarDto) {
    return this.solicitudAdoptarService.crearSolicitud(createSolicitudAdoptarDto);
  }


  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get()
  async verTodasLasSolicitudes(@Query('estado') estado: EstadoAdopcion) {
    return this.solicitudAdoptarService.verCasosAdopcionPorEstado(estado)
  }


  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get('aceptadas/total')
  async contarAceptadas(){
    return await this.solicitudAdoptarService.contarAdopcionesAceptadas();
  }

  @Get('solicitudesDeCadaAdopcion/:id')
  verSolicitudesPorCaso(@Param('id') id: string) {
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(id)
  }

@Get('filtro')
filtrarSolicitudes(@Query() filtro: filtroViviendaQdeMascotasDto) {
  const { casoAdopcionId, tipoVivienda } = filtro;
  return this.solicitudAdoptarService.filtroViviendaQdeMascotas(casoAdopcionId, tipoVivienda);
}

@Patch()
async aceptarSolicitud(@Body() datos: CambiarEstadoDto) {
  const { idDelCasoAdopcion, idDeSolicitudAceptada, estadoNuevo } = datos;

  return this.solicitudAdoptarService.aceptarSolicitud(
    idDelCasoAdopcion,
    idDeSolicitudAceptada,
    estadoNuevo,
  );
}

  @Delete(':id')
  borrarSolicitud(@Param('id') id: string) {
    return this.solicitudAdoptarService.borrarSolicitud(id);
  }
}
