import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { CambiarEstadoDto } from './dtos/cambiar-estado.dto';

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

  @Get('solicitudesDeCadaAdopcion/:id')
  verSolicitudesPorCaso(@Param('id') id: string) {
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(id)
  }

  @Patch()
  cambiarEstado(@Body() datos: CambiarEstadoDto) {
    const { id, estadoNuevo } = datos
    return this.solicitudAdoptarService.cambiarEstado(id, estadoNuevo);
  }

  @Delete(':id')
  borrarSolicitud(@Param('id') id: string) {
    return this.solicitudAdoptarService.borrarSolicitud(id);
  }
}
