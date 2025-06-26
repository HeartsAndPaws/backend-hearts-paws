import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('donacion')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @Get()
  getDetalleDonaciones(){
    return this.donacionService.getDetalleDonaciones();
  }

  @Get('id')
  getDetalleDonacionById(@Param('id') id: string) {
    return this.donacionService.getDetalleDonacionById(id);
  }
  

  @Get('detalle/:CasoId')
  getEstadosMeta(@Param('CasoId') CasoId: string) {

    return this.donacionService.getEstadosMeta(CasoId);

  }
}
