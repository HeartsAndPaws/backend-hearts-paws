import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { CambiarEstadoDto } from './dtos/cambiar-estado.dto';
import { filtroViviendaQdeMascotasDto } from './dtos/filtroViviendaQdeMascotas.dto';

@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}

  @Post()
  create(@Body() createSolicitudAdoptarDto: SolicitudParaAdoptarDto) {
    return this.solicitudAdoptarService.crearSolicitud(createSolicitudAdoptarDto);
  }

  @Get()
  verTodasLasSolicitudes() {
    return this.solicitudAdoptarService.verTodasLasSolicitudes();
  }

  @Get('aceptadas/total')
  async contarAceptadas(){
    return await this.solicitudAdoptarService.contarAdopcionesAceptadas();
  }

  @Get('solicitudesDeCadaAdopcion/:id')
  verSolicitudesPorCaso(@Param('id') id: string) {
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(id)
  }

//   @Get('filtrar')
// filtrarSolicitudes(@Query() filtro: filtroViviendaQdeMascotasDto) {
//   return this.solicitudAdoptarService.filtroViviendaQdeMascotas(filtro.tipoVivienda, filtro.hayOtrasMascotas);
// }

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
