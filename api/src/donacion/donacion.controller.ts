import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('donacion')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @Get()
  getAllDonaciones() {
    return this.donacionService.getDonaciones();
  }

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

}
