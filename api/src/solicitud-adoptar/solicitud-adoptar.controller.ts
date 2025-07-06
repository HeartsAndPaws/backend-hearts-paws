import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UnauthorizedException} from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { CambiarEstadoDto } from './dtos/cambiar-estado.dto';
import { filtroViviendaQdeMascotasDto } from './dtos/filtroViviendaQdeMascotas.dto';
import { EstadoAdopcion } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { Request as ExpressRequest } from 'express';
import { User } from '@supabase/supabase-js';


@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}


  @Post()
  @UseGuards(AuthGuard(['jwt-local', 'supabase']))
  create(
    @Body() createSolicitudAdoptarDto: SolicitudParaAdoptarDto,
    @Req() req: ExpressRequest & { user: User}
  ) {
    const usuarioId = req.user.id;
    return this.solicitudAdoptarService.crearSolicitud(usuarioId, createSolicitudAdoptarDto);
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


  @UseGuards(AuthGuard(['jwt-local', 'supabase']))
  @Get('solicitudesDeCadaAdopcion/:id')
  verSolicitudesPorCaso(@Param('id') id: string) {
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(id)
  }

@Get('filtro')
filtrarSolicitudes(@Query() filtro: filtroViviendaQdeMascotasDto) {
  const { casoAdopcionId, tipoVivienda } = filtro;
  return this.solicitudAdoptarService.filtroViviendaQdeMascotas(casoAdopcionId, tipoVivienda);
}

@Get('existenciaDeSolicitud')
async verifica(
  @Req() req: ExpressRequest & { user: User },
  @Param('idCasoAdopcion') idCasoAdopcion: string
) {
  return this.solicitudAdoptarService.existenciaDeSolicitud(req.user.id, idCasoAdopcion);
}


@UseGuards(AuthGuard(['jwt-local', 'supabase']))
@Patch()
async aceptarSolicitud(@Body() datos: CambiarEstadoDto) {
  const { idDelCasoAdopcion, idDeSolicitudAceptada, estadoNuevo } = datos;

  return this.solicitudAdoptarService.aceptarSolicitud(
    idDelCasoAdopcion,
    idDeSolicitudAceptada,
    estadoNuevo,
  );
}

  @UseGuards(AuthGuard(['jwt-local', 'supabase']))
  @Delete(':id')
  borrarSolicitud(@Param('id') id: string) {
    return this.solicitudAdoptarService.borrarSolicitud(id);
  }
}
