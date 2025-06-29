
import { Injectable } from '@nestjs/common';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonacionService {
  constructor(private readonly prismaService: PrismaService){}

  getDonaciones(){

    return this.prismaService.donacion.findMany({
      include: {
        usuario: true,
        organizacion: true,
        mascota: true,
        casoDonacion: true,
      },
    });

  }

  getDonacionesByOngId(ongId: string){
    return this.prismaService.donacion.findMany({
      where: {
        organizacionId: ongId
      },
      include: {
        usuario: true,
        organizacion: true,
        mascota: true,
        casoDonacion: true,
      },
    });

  }

  getDonacionById(id: string){

    return this.prismaService.donacion.findUnique({
      where: {id: id},
      include: {
        usuario: true,
        organizacion: true,
        mascota: true,
        casoDonacion: true,
      },
    });

  }

  async obtenerValorTotalDonaciones(){
    const resultado = await this.prismaService.donacion.aggregate({
      _sum: {
        monto: true,
      },
    });

    return { total: resultado._sum.monto ?? 0 };
  }

  async getDetalleDonacionByCasoId(CasoId: string) {
    return this.prismaService.casoDonacion.findMany({
      where: {casoId: CasoId},
    })
  }

  async getDetallesDonacion(){
    return this.prismaService.casoDonacion.findMany()
  }
   
  
}
