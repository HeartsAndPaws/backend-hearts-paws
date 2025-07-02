
import { Injectable } from '@nestjs/common';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonacionService {
  constructor(private readonly prismaService: PrismaService){}

  async getDonaciones(filtros: {
    organizacionId?: string;
    usuarioId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }){
    const { organizacionId, usuarioId, fechaDesde, fechaHasta } = filtros;

    return this.prismaService.donacion.findMany({
      where: {
        ...( organizacionId && { organizacionId }),
        ...( usuarioId && { usuarioId }),
        ...( fechaDesde && {
          fecha: {
            gte: new Date( fechaDesde),
          },
        }),
        ...(fechaHasta && {
          fecha: {
            ...(fechaDesde ? { gte: new Date(fechaDesde)}: {}),
            lte: new Date(fechaHasta),
          },
        }),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        organizacion: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        mascota: {
          select: {
            id: true,
            nombre: true,
          },
        },
        casoDonacion: {
          select: {
            id: true,
            caso: {
              select: {
                titulo: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'desc',
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
