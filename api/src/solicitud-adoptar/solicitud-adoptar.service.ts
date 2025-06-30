import { Injectable, NotFoundException } from '@nestjs/common';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAdopcion } from '@prisma/client';

@Injectable()
export class SolicitudAdoptarService {
  constructor(private readonly prisma: PrismaService) {}
  async crearSolicitud(solicitud: SolicitudParaAdoptarDto) {
    const { 
      usuarioId, 
      casoAdopcionId, 
      estado, 
      tipoVivienda, 
      integrantesFlia, 
      hijos,  
      hayOtrasMascotas,
    descripcionOtrasMascotas, cubrirGastos, darAlimentoCuidados, darAmorTiempoEj,
    devolucionDeMascota, siNoPodesCuidarla, declaracionFinal} = solicitud

    const usuarioSolicitante = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId
      },
    });
    if(!usuarioSolicitante){
      throw new Error('Falta el usuario solicitante')
    }
    const nuevaSolicitud = await this.prisma.solicitudDeAdopcion.create({
      data: {
        usuarioId, casoAdopcionId: casoAdopcionId, estado, tipoVivienda, integrantesFlia, hijos, hayOtrasMascotas,
    descripcionOtrasMascotas, cubrirGastos, darAlimentoCuidados, darAmorTiempoEj,
    devolucionDeMascota, siNoPodesCuidarla, declaracionFinal
      },
    });
  
    return nuevaSolicitud
  }

  async verTodasLasSolicitudes() {
    return await this.prisma.solicitudDeAdopcion.findMany();

  }

// En mascota.service.ts

async obtenerMascotasConAdopcionPorOng(ongId: string) {
  return await this.prisma.mascota.findMany({
    where: {
      organizacionId: ongId,
      casos: {
        some: {
          tipo: 'ADOPCION',
        },
      },
    },
    include: {
      casos: {
        where: {
          tipo: 'ADOPCION',
        },
        include: {
          adopcion: true,
        },
      },
    },
  });
}

  // async filtroViviendaQdeMascotas(tipoVivienda: string, hayOtrasMascotas: string) {
  //     return await this.prisma.solicitudDeAdopcion.findMany({
  //   where: {
  //     tipoVivienda,
  //     hayOtrasMascotas,
  //   },
  //   include: {
  //     usuario: true,
  //     casoAdopcion: true,
  //   },
  // });
  // }

  async verSolicitudesPorCasoDeAdopcion(casoId: string) {
  const casoAdopcion = await this.prisma.casoAdopcion.findUnique({
    where: {
      casoId,
    },
    include: {
      solicitudes: {
        include: { usuario: true,},
      },
    },
  });

  if (!casoAdopcion) {
    throw new NotFoundException(`No se encontró el caso de adopción para el caso con ID ${casoId}`);
  }
  return casoAdopcion.solicitudes;
}

async cambiarEstado(idDelCasoAdopcion: string, idDeSolicitudAceptada, estadoNuevo: EstadoAdopcion) {
  // 1. Cambiar estado del CasoAdopcion
  const adopcionActualizada = await this.prisma.casoAdopcion.update({
    where: { id: idDelCasoAdopcion },
    data: { estado: estadoNuevo },
  });

  // 2. Si se acepta, actualizar el resto de las solicitudes a RECHAZADA
  if (estadoNuevo === 'ACEPTADA') {
    await this.prisma.solicitudDeAdopcion.updateMany({
      where: {
        casoAdopcionId: idDelCasoAdopcion,
        estado: 'PENDIENTE',
      },
      data: {
        estado: 'RECHAZADA',
      },
    });
          await this.prisma.solicitudDeAdopcion.update({
          where: {id: idDeSolicitudAceptada},
          data: {estado: 'ACEPTADA'}
  })
  }

  return adopcionActualizada;
}


  async borrarSolicitud(id: string) {
    await this.prisma.solicitudDeAdopcion.delete({
  where: {
    id
  },
});
  return { mensaje: `Solicitud borrada id: ${id}`}
  }

  async contarAdopcionesAceptadas(){
    const total = await this.prisma.casoAdopcion.count({
      where: {
        estado: EstadoAdopcion.ACEPTADA,
      },
    });

    return { total };
  }
}
