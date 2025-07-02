import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';

@Controller('donacion')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}


  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllDonaciones(
    @Query('nombreUsuario') nombreUsuario?: string,
    @Query('emailUsuario') emailUsuario?: string,
    @Query('nombreOng') nombreOng?: string,
    @Query('emailOng') emailOng?: string,
    @Query('fecha') fecha?: string,
  ) {
    return await this.donacionService.getDonaciones({
      nombreUsuario,
      emailUsuario,
      nombreOng,
      emailOng,
      fecha,
    });
  }


  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get('total')
  async obtenerTotalDonado(){
    return await this.donacionService.obtenerValorTotalDonaciones();
  }

  @Get('/ong/:ongId')
  getDonacionesByOngId(@Param('ongId') ongId: string) {
    return this.donacionService.getDonacionesByOngId(ongId);
  }

  @Get(':id')
  getDonacionById(@Param('id') id: string) {
    return this.donacionService.getDonacionById(id);
  }

  @Get('detalleDonacion/:CasoId')
  getDetalleDonacionByCasoId(@Param('CasoId') CasoId: string) {
    return this.donacionService.getDetalleDonacionByCasoId(CasoId);
  }

  @Get('detalle/donaciones')
  getDetallesDonacion(){

    return this.donacionService.getDetallesDonacion();

  }

}
