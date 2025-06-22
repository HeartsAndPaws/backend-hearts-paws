import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CreateCasoDto } from './dto/create-caso.dto';
import { UpdateCasoDto } from './dto/update-caso.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('casos')
export class CasosController {
  constructor(
    private readonly casosService: CasosService
  ) {}

  @Get()
  GetCasos(){
    return this.casosService.GetCasos();
  }

  @Get('adopcion')
  GetCasosAdopcion() {
    return this.casosService.GetCasosAdopcion();
  }

  @Get('donacion')
  GetCasosDonacion() {
    return this.casosService.GetCasosDonacion();
  }

  @Get('adopcion/buscar')
  @ApiQuery({ name: 'tipo', required: true, description: 'Tipo de mascota (Perro, Gato, etc.)' })
  @ApiOperation({ summary: 'Buscar casos de adopción por tipo de mascota' })
  busquedaAdopcion(@Query('tipo') tipo: string){
    return this.casosService.buscarCasosDeAdopcionPorTipoDeMascota(tipo)
  }

  @Get('donacion/buscar')
  @ApiQuery({ name: 'tipo', required: true, description: 'Tipo de mascota (Perro, Gato, etc.)' })
@ApiOperation({ summary: 'Buscar casos de donación por tipo de mascota' })
  busquedaDonacion(@Query('tipo') tipo: string){
    return this.casosService.buscarCasosDeDonacionPorTipoDeMascota(tipo)
  }

  @Post()
  CreateCaso(@Body() createCasoDto: CreateCasoDto) {
    return this.casosService.CreateCaso(createCasoDto);
  }

  @Get('buscar')
  async buscarCasos(@Query('tipo') tipoMascota?: string, @Query('nombre') nombreMascota?: string) {
    return this.casosService.buscarCasos({ tipoMascota, nombreMascota }); 

  }

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
