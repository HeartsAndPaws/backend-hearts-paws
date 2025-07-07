
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatearARS, calcularPorcentajeProgreso } from 'src/utils/formatters';

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

    const donaciones = await this.prismaService.donacion.findMany({
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

    return donaciones.map((d) => ({
      ...d,
      montoFormateado: formatearARS(d.monto),
    }))
  }

  async getDonacionesByOngId(ongId: string){
    const donaciones = await this.prismaService.donacion.findMany({
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

    return donaciones.map((d) => ({
      ...d,
      montoformateado: formatearARS(d.monto),
    }))

  }

  async getDonacionById(id: string){

    const donacion = await this.prismaService.donacion.findUnique({
      where: {id: id},
      include: {
        usuario: true,
        organizacion: true,
        mascota: true,
        casoDonacion: true,
      },
    });

    return {
      ...donacion,
      montoformateado: donacion ? formatearARS(donacion.monto) : null,
    }
  }

  async obtenerValorTotalDonaciones(){
    const resultado = await this.prismaService.donacion.aggregate({
      _sum: {
        monto: true,
      },
    });

    return { 
      total: resultado._sum.monto ?? 0,
      totalFormatado: formatearARS(resultado._sum.monto ?? 0),
    }
  }

  async getDetalleDonacionByCasoId(CasoId: string) {
    const haDonado = await this.prismaService.donacion.findFirst({
      where: {
        casoDonacion: {
          casoId: CasoId,
        },
      },
    });

    if (!haDonado) {
      throw new ForbiddenException('No tienes permiso para ver el detalle de esta donacion')
    }

    const casos =await this.prismaService.casoDonacion.findMany({
      where: {casoId: CasoId},
    });

    return casos.map((caso) => ({
      ...caso,
      estadoDonacionARS: formatearARS(caso.estadoDonacion),
      metaDonacionARS: formatearARS(caso.metaDonacion),
      progreso: calcularPorcentajeProgreso(caso.metaDonacion, caso.estadoDonacion),
    }))
  }

  async getDetallesDonacion(){
    const casos = await this.prismaService.casoDonacion.findMany();

    return casos.map((caso) => ({
      ...caso,
      estadoDonacionARS: formatearARS(caso.estadoDonacion),
      metaDonacionARS: formatearARS(caso.metaDonacion),
      progreso: calcularPorcentajeProgreso(caso.metaDonacion, caso.estadoDonacion),
    }))
  }
  
}
