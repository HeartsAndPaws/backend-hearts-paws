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
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(AuthGuard(['jwt-local', 'supabase']))
@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}

  @Post()
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

  @UseGuards(AuthGuard('jwt-local'))
  @Get('/solicitudesDeCadaAdopcion')
  verSolicitudesPorCaso(@Req() req: AuthenticateRequest) {
    const ongId = req.user.id;
    return this.solicitudAdoptarService.verSolicitudesPorCasoDeAdopcion(ongId)
  }

@Get('filtro')
filtrarSolicitudes(@Query() filtro: filtroViviendaQdeMascotasDto) {
  const { casoAdopcionId, tipoVivienda } = filtro;
  return this.solicitudAdoptarService.filtroViviendaQdeMascotas(casoAdopcionId, tipoVivienda);
}

@Get('yaExisteLaSolicitud/:idCasoAdopcion')
async verifica(
  @Req() req: ExpressRequest & { user: User },
  @Param('idCasoAdopcion') idCasoAdopcion: string
) {
  const userId = req.user.id
  console.log(userId)
  return this.solicitudAdoptarService.existenciaDeSolicitud(userId, idCasoAdopcion);
}

@Patch()
async aceptarSolicitud(
  @Req() req: AuthenticateRequest,
  @Body() datos: CambiarEstadoDto) {
  const { idDelCasoAdopcion, idDeSolicitudAceptada, estadoNuevo } = datos;

  if (req.user.tipo !== 'ONG') {
    throw new UnauthorizedException('Solo una organización puede realizar esta acción');
  }

  return this.solicitudAdoptarService.aceptarSolicitud(
    idDelCasoAdopcion,
    idDeSolicitudAceptada,
    estadoNuevo,
    req.user.id,
  );
}
  @Delete(':id')
  borrarSolicitud(@Param('id') id: string) {
    return this.solicitudAdoptarService.borrarSolicitud(id);
  }
}
