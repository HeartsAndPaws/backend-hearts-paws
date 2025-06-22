import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCasoDto } from './dto/create-caso.dto';
import { UpdateCasoDto } from './dto/update-caso.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

      await this.prismaService.casoAdopcion.create({
        data: {
          casoId: caso.id,
          estado: 'PENDIENTE',
        },
      });

    } else if(createCasoDto.tipo === 'DONACION' && createCasoDto.donacion) {
      await this.prismaService.casoDonacion.create({
        data: {
          casoId: caso.id,
          metaDonacion: createCasoDto.donacion.metaDonacion,
          estadoDonacion: 0,
        },
      });
    }

    return caso;

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
    return await this.prismaService.donacion.findMany({
      where: {
        mascota: {
          tipo: {
            nombre: {
              equals: tipo.toUpperCase(),
            },
          },
        },
      },
      include: {
        mascota: true,
        organizacion: true,
        usuario: true,
      },
    });
  }

    async filtroParaAdopcionesPorMascota(tipo: string) {
    return await this.prismaService.adopcion.findMany({
      where: {
        mascota: {
          tipo: {
            nombre: {
              equals: tipo.toUpperCase(),
            },
          },
        },
      },
      include: {
        mascota: true,
        organizacion: true,
        usuario: true,
      },
    });
  }
}