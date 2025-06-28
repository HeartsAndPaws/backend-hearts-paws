import { Injectable } from '@nestjs/common';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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



  async verSolicitudesPorCasoDeAdopcion(id: string) {
  return await this.prisma.casoAdopcion.findUnique({
    where: {
      id,
    },
    include: {
      solicitudes: {
        include: {
          usuario: true,
        },
      },
    },
  });
}

  async cambiarEstado(id: string, estadoNuevo) {
    const adopcionActualizada = await this.prisma.casoAdopcion.update({
  where: {
    id
  },
  data: {
    estado: estadoNuevo
  },
})
    return adopcionActualizada
;

  }

  async borrarSolicitud(id: string) {
    await this.prisma.solicitudDeAdopcion.delete({
  where: {
    id
  },
});
  return { mensaje: `Solicitud borrada id: ${id}`}
  }
}
