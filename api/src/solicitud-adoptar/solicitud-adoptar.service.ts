import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAdopcion } from '@prisma/client';
import { MailerService } from 'src/shared/email/email-server.service';
import { timeout } from 'rxjs';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

@Injectable()
export class SolicitudAdoptarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService
  ) {}


  async crearSolicitud(usuarioId: string ,solicitud: SolicitudParaAdoptarDto) {
    const { 
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

  if (!usuarioSolicitante) {
    throw new BadRequestException('Falta el usuario solicitante');
  }

  const solicitudExistente = await this.prisma.solicitudDeAdopcion.findFirst({
    where: {
      usuarioId,
      casoAdopcionId
    }
  });

  if (solicitudExistente) {
    throw new BadRequestException('El usuario no puede enviar mas de 1 solicitud para el mismo caso de adopción');
  }

  const nuevaSolicitud = await this.prisma.solicitudDeAdopcion.create({
    data: {
      usuarioId, casoAdopcionId, estado, tipoVivienda, integrantesFlia, hijos, hayOtrasMascotas,
      descripcionOtrasMascotas, cubrirGastos, darAlimentoCuidados, darAmorTiempoEj,
      devolucionDeMascota, siNoPodesCuidarla, declaracionFinal
    },
  });

  return nuevaSolicitud;
}

  async verCasosAdopcionPorEstado(estado?: EstadoAdopcion) {
    return await this.prisma.casoAdopcion.findMany({
      where: estado ? {
        solicitudes: {
          some: {
            estado: estado
          },
        },
      } : {},
      include: {
        caso: {
          include: {
            mascota: {
              include: {
                organizacion: true,
                tipo: true,
                imagenes: true,
              },
            },
          },
        },
        solicitudes: {
          where: estado ? { estado } : undefined, 
          include:{
            usuario: true,
          },
        },
      },
    });
  }


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

async filtroViviendaQdeMascotas(
  casoAdopcionId: string,
  tipoVivienda?: string,
) {
  return this.prisma.solicitudDeAdopcion.findMany({
    where: {
      casoAdopcionId,
      ...(tipoVivienda && { tipoVivienda }),
    },
    orderBy: {
      hayOtrasMascotas: 'asc', // Orden de menor a mayor
    },
    include: {
      usuario: true,
      casoAdopcion: true,
    },
  });
}


  async verSolicitudesPorCasoDeAdopcion(ongId: string) {
    const mascotas = await this.prisma.mascota.findMany({
    where: { organizacionId: ongId },
    include: {
      imagenes: true,
      casos: {
        where: {
          tipo: 'ADOPCION',
        },
        include: {
          adopcion: {
            include: {
              solicitudes: {
                include: {
                  usuario: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const resultado = mascotas.map((mascota) => {
    const casoAdopcion = mascota.casos[0]?.adopcion;
    const solicitudes = casoAdopcion?.solicitudes || [];

    return {
      mascota: {
        id: mascota.id,
        nombre: mascota.nombre,
        edad: mascota.edad,
        descripcion: mascota.descripcion,
        imagenes: mascota.imagenes,
      },
      solicitudes: solicitudes.map((s) => ({
        id: s.id,
        estado: s.estado,
        tipoVivienda: s.tipoVivienda,
        integrantesFlia: s.integrantesFlia,
        hijos: s.hijos,
        hayOtrasMascotas: s.hayOtrasMascotas,
        descripcionOtrasMascotas: s.descripcionOtrasMascotas,
        cubrirGastos: s.cubrirGastos,
        darAlimentoCuidados: s.darAlimentoCuidados,
        darAmorTiempoEj: s.darAmorTiempoEj,
        devolucionDeMascota: s.devolucionDeMascota,
        siNoPodesCuidarla: s.siNoPodesCuidarla,
        declaracionFinal: s.declaracionFinal,
        usuario: {
          id: s.usuario.id,
          nombre: s.usuario.nombre,
          email: s.usuario.email,
          telefono: s.usuario.telefono,
          direccion: s.usuario.direccion,
          ciudad: s.usuario.ciudad,
          pais: s.usuario.pais,
          imagenPerfil: s.usuario.imagenPerfil,
        },
      })),
    };
  });

  return resultado;

}

async aceptarSolicitud(
  idDelCasoAdopcion: string,
  idDeSolicitudAceptada: string,
  estadoNuevo: EstadoAdopcion,
) {
  // 1. Actualizar estado general del caso
  await this.prisma.casoAdopcion.update({
    where: { id: idDelCasoAdopcion },
    data: { estado: estadoNuevo },
  });

  if (estadoNuevo === 'ACEPTADA') {
    // 2. Obtener todas las solicitudes del caso (pendientes y aceptada)
    const solicitudes = await this.prisma.solicitudDeAdopcion.findMany({
      where: {
        casoAdopcionId: idDelCasoAdopcion,
      },
      include: {
        usuario: true,
      },
    });

    // 3. Rechazar las demás solicitudes pendientes
    await this.prisma.solicitudDeAdopcion.updateMany({
      where: {
        casoAdopcionId: idDelCasoAdopcion,
        estado: 'PENDIENTE',
        NOT: {
          id: idDeSolicitudAceptada,
        },
      },
      data: {
        estado: 'RECHAZADA',
      },
    });

    // 4. Aceptar la solicitud seleccionada
    await this.prisma.solicitudDeAdopcion.update({
      where: { id: idDeSolicitudAceptada },
      data: { estado: 'ACEPTADA' },
    });

    // 5. Extraer correos y nombre de mascota
    const listaDeCorreos = solicitudes.map(s => s.usuario.email);
    const emailAceptado = solicitudes.find(s => s.id === idDeSolicitudAceptada)?.usuario.email;

    // const nombreMascota = await this.obtenerNombreMascotaPorCasoAdopcion(idDelCasoAdopcion);

    let mascotaEncontrada = await this.prisma.casoAdopcion.findUnique({
      where: { id: idDelCasoAdopcion },
      select: {
        caso: {
          select: {
            mascota: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    const nombreMascota = mascotaEncontrada?.caso?.mascota?.nombre;

    // 6. Enviar correos
    if (emailAceptado && listaDeCorreos.length && nombreMascota) {
      await this.mailerService.enviarEmailsNotificacionAdopcion(
        listaDeCorreos,
        emailAceptado,
        nombreMascota,
      );
    }
  }

  return { message: 'Estado actualizado correctamente.' };
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
