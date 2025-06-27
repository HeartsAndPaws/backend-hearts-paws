import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCasoDto } from './dto/create-caso.dto';
import { UpdateCasoDto } from './dto/update-caso.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoCaso } from '@prisma/client';
import { FiltroViejoRecienteEnum } from './enums/filtro-tipo-reciente-antiguo.enum';

@Injectable()
export class CasosService {
  constructor(private readonly prismaService: PrismaService){}

  async GetCasos() {

    return this.prismaService.caso.findMany({
      include: {
        mascota: true,
        ong: true,
      }
    });

  }
  
  async GetCasoById(id: string) {
    return this.prismaService.caso.findUnique({
      where: { id },
      include: {
        mascota: true,
        ong: true,
      },
    });
  }
  
  async GetCasosAdopcion() {
    return this.prismaService.caso.findMany({
      where: { tipo: 'ADOPCION' },
      include: {
        mascota: {
          include: {
            imagenes: {
              take: 1,
              orderBy: { subida_en: 'desc'}, // Trae la imagen más reciente
            },
          },
        },
        ong: true
      },
    });
    
  }

  async GetCasosDonacion() {
    return this.prismaService.caso.findMany({
      where: { tipo: 'DONACION' },
      include: {
        mascota: {
          include: {
            imagenes: {
              take: 1,
              orderBy: { subida_en: 'desc'}, // Trae solo la imagen más reciente
            },
          },
        },
        ong: true
      },
    });
  }

  async obtenerIdDelCasoAdopcion(mascotaId: string) {
  const mascota = await this.prismaService.mascota.findUnique({
    where: { id: mascotaId },
    include: {
      casos: {
        where: { tipo: 'ADOPCION' },
        include: {
          adopcion: true,
        },
      },
    },
  });

  if (!mascota) {
    throw new NotFoundException('Mascota no encontrada');
  }

  const casoConAdopcion = mascota.casos.find((caso) => caso.adopcion);

  if (!casoConAdopcion) {
    throw new NotFoundException('No se encontró un CasoAdopcion para esta mascota');
  }

  return { casoAdopcionId: casoConAdopcion.adopcion!.id };
}
  async CreateCaso(createCasoDto: CreateCasoDto) {
    
    const casoExistente = await this.prismaService.caso.findFirst({
      where: {
        tipo: createCasoDto.tipo,
        mascotaId: createCasoDto.mascotaId,
      }
    })

    if (casoExistente) {
      throw new BadRequestException(`Ya existe un caso de tipo ${createCasoDto.tipo} para la mascota con ID ${createCasoDto.mascotaId}`);
    }

    const caso = await this.prismaService.caso.create({
      data: {
        titulo: createCasoDto.titulo,
        descripcion: createCasoDto.descripcion,
        tipo: createCasoDto.tipo,
        mascotaId: createCasoDto.mascotaId,
        ongId: createCasoDto.ongId,
      },
    });

    if(createCasoDto.tipo === 'ADOPCION') {

    const casoAdopcion =  await this.prismaService.casoAdopcion.create({
        data: {
          casoId: caso.id,
          estado: 'PENDIENTE',
        },
      });
      const casoAdopcionEncontrado = await this.prismaService.casoAdopcion.findUnique({
        where: { casoId: caso.id }
      })
      return casoAdopcionEncontrado

    } else if(createCasoDto.tipo === 'DONACION' && createCasoDto.donacion) {
      await this.prismaService.casoDonacion.create({
        data: {
          casoId: caso.id,
          metaDonacion: createCasoDto.donacion.metaDonacion,
          estadoDonacion: 0,
        },
      });
      const casoDonacionEncontrado = await this.prismaService.casoDonacion.findUnique({
        where: { casoId: caso.id }
      })
    }
  }

  async buscarCasos(filtros: { tipoMascota?: string; nombreMascota?: string }) {
    
    return this.prismaService.caso.findMany({
      where: {
        mascota: {
          ...(filtros.tipoMascota && {
            tipo: { nombre: { equals: filtros.tipoMascota, mode: 'insensitive' } }
          }),
          ...(filtros.nombreMascota && {
            nombre: { contains: filtros.nombreMascota, mode: 'insensitive' }
          })
        }
      },
      include: {
        mascota: {
          include: {
            tipo: true,
            imagenes: true,
          }
        },
        ong: true,
        adopcion: true,
        donacion: true,
      }
    })
  }

async filtroParaDonacionesPorMascota(tipo: string) {
  return await this.prismaService.caso.findMany({
    where: {
      tipo: 'DONACION',
      mascota: {
        tipo: {
          nombre: {
            equals: tipo,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      donacion: true,
      mascota: {
        include: {
          tipo: true,
          imagenes: true,
        },
      },
      ong: true,
    },
  });
}

async filtroParaAdopcionesPorMascota(tipo: string) {
  return await this.prismaService.caso.findMany({
    where: {
      tipo: 'ADOPCION',
      mascota: {
        tipo: {
          nombre: {
            equals: tipo,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      adopcion: true,
      mascota: {
        include: {
          tipo: true,
          imagenes: true,
        }
      },
      ong: true
    }
  })
}

async buscarCasosPorTipoYFechas(tipo: TipoCaso, fechaDesde: string, fechaHasta: string) {
  const desde = new Date(fechaDesde);
  const hasta = new Date(fechaHasta);

  return this.prismaService.caso.findMany({
    where: {
      tipo: tipo as TipoCaso,
      creado_en: {
        gte: desde,
        lte: hasta,
      },
    },
    include: {
      mascota: {
        include: {
          tipo: true,
          imagenes: true,
        }
      },
      ong: true,
      adopcion: true,
      donacion: true,
    }
  });
}

async obtenerCasosPorOngConFiltros(ongId: string, orden?: string, tipoMascota?: string){
    return this.prismaService.caso.findMany({
    where: {
      ...(ongId && { ongId }),
      ...(tipoMascota && {
        mascota: {
          tipo: {
            nombre: tipoMascota.toUpperCase(),
          },
        },
      }),
    },
    orderBy: {
      creado_en: orden === FiltroViejoRecienteEnum.Reciente ? 'desc' : 'asc',
    },
    include: {
      mascota: {
        include: {
          tipo: true,
          imagenes: true,
        },
      },
      ong: true,
      adopcion: true,
      donacion: true,
    },
  });
}

async buscarCasosDeDonacionPorTipoDeMascota(tipo: string) {
  return this.prismaService.caso.findMany({
    where: {
      donacion: {
        isNot: null,
      },
      mascota: {
        tipo: {
          nombre: {
            equals: tipo,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      mascota: {
        include: {
          tipo: true,
          imagenes: true
        },
      },
      ong: true,
      donacion: true,
    },
  });
}
}