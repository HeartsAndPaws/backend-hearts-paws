import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('Donaciones')
@Controller('donacion')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Obtener todas las donaciones, con filtros opcionales (ADMIN)' })
  @ApiQuery({ name: 'nombreUsuario', type: 'string', required: false })
  @ApiQuery({ name: 'emailUsuario', type: 'string', required: false })
  @ApiQuery({ name: 'nombreOng', type: 'string', required: false })
  @ApiQuery({ name: 'emailOng', type: 'string', required: false })
  @ApiQuery({ name: 'fecha', type: 'string', required: false, description: 'Fecha en formato YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Lista de donaciones filtradas' })
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
  @ApiOperation({ summary: 'Obtener el valor total donado en la plataforma (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Valor total donado', schema: { example: { total: 12345.67 } } })
  async obtenerTotalDonado() {
    return await this.donacionService.obtenerValorTotalDonaciones();
  }

  @UseGuards(AuthGuard('jwt-local'))
  @Get('/ong')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las donaciones de la ONG autenticada' })
  @ApiResponse({ status: 200, description: 'Lista de donaciones para la ONG autenticada' })
  getDonacionesByOngId(@Req() req: AuthenticateRequest) {
    const ongId = req.user.id;
    return this.donacionService.getDonacionesByOngId(ongId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la donación' })
  @ApiResponse({ status: 200, description: 'Donación encontrada' })
  getDonacionById(@Param('id') id: string) {
    return this.donacionService.getDonacionById(id);
  }


  @Get('detalleDonacion/:CasoId')
  @ApiOperation({ summary: 'Obtener el detalle de donación por ID de caso' })
  @ApiParam({ name: 'CasoId', type: 'string', description: 'ID del caso de donación' })
  @ApiResponse({ status: 200, description: 'Detalle de donación para el caso' })
  getDetalleDonacionByCasoId(@Param('CasoId') CasoId: string) {
    return this.donacionService.getDetalleDonacionByCasoId(CasoId);
  }

  @Get('detalle/donaciones')
  @ApiOperation({ summary: 'Obtener el detalle de todas las donaciones' })
  @ApiResponse({ status: 200, description: 'Lista detallada de donaciones' })
  getDetallesDonacion() {
    return this.donacionService.getDetallesDonacion();
  }
}
