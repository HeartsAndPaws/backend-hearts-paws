import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CreateCasoDto } from './dto/create-caso.dto';
import { UpdateCasoDto } from './dto/update-caso.dto';

@Controller('casos')
export class CasosController {
  constructor(private readonly casosService: CasosService) {}

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
  busquedaAdopcion(@Query('tipo') tipo: string){
    return this.casosService.buscarCasosDeAdopcionPorTipoDeMascota(tipo)
  }

  @Get('donacion/buscar')
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

  
}
