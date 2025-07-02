
import { Injectable } from '@nestjs/common';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DonacionService {
  constructor(private readonly prismaService: PrismaService){}

  async getDonaciones(filtros: {
    nombreUsuario?: string;
    emailUsuario?: string;
    nombreOng?: string;
    emailOng?: string;
    fecha?: string; // YYYY-MM-DD
  }){
    const { nombreUsuario, emailUsuario, nombreOng, emailOng, fecha } = filtros;

    const fechaInicio = fecha ? new Date(`${fecha}T00:00:00Z`) : undefined;
    const fechaFin = fecha ? new Date(`${fecha}T23:59:59Z`) : undefined;

    return this.prismaService.donacion.findMany({
      where: {
        ...( fechaInicio && fechaFin && {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        }),
        usuario: {
          ...(nombreUsuario && { nombre: { contains: nombreUsuario, mode: 'insensitive' } }),
          ...(emailUsuario && { email: { contains: emailUsuario, mode: 'insensitive' } }),
        },
        organizacion: {
          ...(nombreOng && { nombre: { contains: nombreOng, mode: 'insensitive' } }),
          ...(emailOng && { email: { contains: emailOng, mode: 'insensitive' } }),
        }
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
