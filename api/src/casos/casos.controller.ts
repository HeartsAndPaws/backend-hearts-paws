import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CreateCasoDto } from './dto/create-caso.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FiltrarPorCasosFechasDto } from './dto/filtro-por-caso-y-fecha.dto';
import { FiltrarPorTipoViejoRecienteDto } from './dto/filtro-tipo-viejo-reciente.dto';
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('casos')
export class CasosController {
  constructor(
    private readonly casosService: CasosService
  ) {}

  @UseGuards(AuthGuard(['jwt-local']))
  @Get()
  GetCasos(){
    return this.casosService.GetCasos();
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('adopcion')
  GetCasosAdopcion() {
    return this.casosService.GetCasosAdopcion();
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('donacion')
  GetCasosDonacion() {
    return this.casosService.GetCasosDonacion();
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('idAdopcion/:mascotaId')
  obtenerIdAdopcion(@Param('mascotaId') mascotaId: string){
    return this.casosService.obtenerIdDelCasoAdopcion(mascotaId)
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('adopcion/buscar')
  @ApiQuery({ name: 'tipo', required: true, description: 'Tipo de mascota (Perro, Gato, etc.)' })
  @ApiOperation({ summary: 'Buscar casos de adopción por tipo de mascota' })
  busquedaAdopcion(@Query('tipo') tipo: string){
    return this.casosService.filtroParaAdopcionesPorMascota(tipo)
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('donacion/buscar')
  @ApiQuery({ name: 'tipo', required: true, description: 'Tipo de mascota (Perro, Gato, etc.)' })
  @ApiOperation({ summary: 'Buscar casos de donación por tipo de mascota' })
  busquedaDonacion(@Query('tipo') tipo: string){
    return this.casosService.buscarCasosDeDonacionPorTipoDeMascota(tipo)
  }

@UseGuards(AuthGuard(['jwt-local']))
@Get('filtro-casos-fechas/buscar')
buscarPorTipoYFechas(@Query() filtros: FiltrarPorCasosFechasDto) {
  return this.casosService.buscarCasosPorTipoYFechas(filtros.tipo, filtros.fechaDesde, filtros.fechaHasta);
}

@UseGuards(AuthGuard(['jwt-local']))
@Get('filtro-tipo-mascota-orden-temporal')
filtroPorTipoRecienteAntiguo(@Query() filtros: FiltrarPorTipoViejoRecienteDto) {
  return this.casosService.filtrarPorTipoYordenTemporal(filtros.ongId, filtros.viejoReciente, filtros.tipoMascota);
}

  @UseGuards(AuthGuard(['jwt-local']))
  @Post()
  CreateCaso(
    @Req() req: AuthenticateRequest,
    @Body() createCasoDto: CreateCasoDto) {
      const ongId = req.user.id;
      if (req.user.tipo !== 'ONG') {
        throw new UnauthorizedException('Solo una organización puede crear casos.')
      }
    return this.casosService.CreateCaso(createCasoDto, ongId);
  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get('buscar')
  async buscarCasos(@Query('tipo') tipoMascota?: string, @Query('nombre') nombreMascota?: string) {
    return this.casosService.buscarCasos({ tipoMascota, nombreMascota }); 

  }

  @UseGuards(AuthGuard(['jwt-local']))
  @Get(':id')
  GetCasoById(@Param('id') id: string) {
    return this.casosService.GetCasoById(id);
  }
  
  @UseGuards(AuthGuard('jwt-local'))
  @Get('ong/mis-casos')
  @ApiParam({ name: 'id', description: 'ID de la organización' })
  @ApiOperation({ summary: 'Obtener todos los casos de una ONG' })
  @ApiResponse({ status: 200, description: 'Casos obtenidos exitosamente' })
  async obtenerCasosPorOng(@Req() req){
    const ongId = req.user.id;

    if (req.user.tipo !== 'ONG') {
      throw new UnauthorizedException('Solo una organizacion puede acceder a esta ruta.')
    }
    return await this.casosService.obtenerCasosPorOng(ongId);
  }
}
