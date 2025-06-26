
import { Injectable } from '@nestjs/common';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonacionService {
  constructor(private readonly prismaService: PrismaService){}

  getDetalleDonaciones(){

    return this.prismaService.casoDonacion.findMany()

  }

  getDetalleDonacionById(id: string){

    return this.prismaService.casoDonacion.findMany({
      where: {id: id}
    })

  }


  getEstadosMeta(CasoId: string){

    return this.prismaService.casoDonacion.findMany({
      where: {
        casoId: CasoId
      },
      select: {
        estadoDonacion: true,
        metaDonacion: true,
        estado: true,
        
      }
    });
  }
  
}
