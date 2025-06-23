import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { UpdateSolicitudAdoptarDto } from './dtos/update-solicitud-adoptar.dto';

@Controller('solicitud-adoptar')
export class SolicitudAdoptarController {
  constructor(private readonly solicitudAdoptarService: SolicitudAdoptarService) {}

  @Post()
  create(@Body() createSolicitudAdoptarDto: SolicitudParaAdoptarDto) {
    return this.solicitudAdoptarService.crearSolicitud(createSolicitudAdoptarDto);
  }

  @Get()
  verSolicitdesDeAdopcion() {
    return this.solicitudAdoptarService.verSolicitudes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudAdoptarService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudAdoptarDto: UpdateSolicitudAdoptarDto) {
    return this.solicitudAdoptarService.update(+id, updateSolicitudAdoptarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudAdoptarService.remove(+id);
  }
}
