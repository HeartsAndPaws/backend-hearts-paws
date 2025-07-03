import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ActualizarUsuarioDTO } from './dto/ActualizarUsuario.dto';
import { Rol } from '@prisma/client';
import { GoogleVisionService } from 'src/google-vision/google-vision.service';


@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleVisionService: GoogleVisionService
  ){}

  

  async actualizarFotoPerfil(id: string, fotoUrl: string){
    const usuario = await this.prisma.usuario.findUnique({where: {id}});

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con id ${ id }`);
    }
      const analisis = await this.googleVisionService.analizarImagen(fotoUrl);

  if (analisis.advertencia) {
    throw new BadRequestException('La imagen parece contener contenido sensible. Intenta con otra imagen.');
  }
    return this.prisma.usuario.update({
      where: { id },
      data: { imagenPerfil: fotoUrl}
    });
  }

    async usuarioPorId(id: string, external = false) {
      const where = external ? { externalId: id } : { id };

      const usuario = await this.prisma.usuario.findUnique({
        where,
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          imagenPerfil: true,
          telefono: true,
          direccion: true,
          ciudad: true,
          pais: true,
          creado_en: true,
        },
      });
  
      if (!usuario) {
        throw new NotFoundException(`No se encontró el usuario con ${external ? 'externalId' : 'id'} ${id}`);
      }
  
      return usuario;
    }

    async listaDeUsuarios(filtros?: { 
      rol?: Rol; 
      pais?: string;
      email?: string;
      nombre?: string;
    }) {
      const { rol, pais, email, nombre } = filtros || {};

    return await this.prisma.usuario.findMany({
      where: {
        ...( rol ? { rol } : {}),
        ...( pais ? { pais: { contains: pais, mode: 'insensitive'}}: {}),
        ...( email && { email: {contains: email, mode: 'insensitive'} }),
        ...( nombre && { nombre: {contains: nombre, mode: 'insensitive'}}),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        imagenPerfil: true,
        pais: true,
        // No incluir contraseñas ni otros campos sensibles
      },
    });
  }


  async actualizarUsuario(id: string, datosDeUsuario: ActualizarUsuarioDTO) {
    const { email, contrasena, telefono, direccion, ciudad, pais } = datosDeUsuario;
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);
    }

    const data: any = {};

    const esExterno = !!usuario.externalId;

    if (!esExterno && datosDeUsuario.email) {
      data.email = datosDeUsuario.email
    }

    if (!esExterno && datosDeUsuario.contrasena) {
      data.contrasena = await bcrypt.hash(datosDeUsuario.contrasena, 10)
    }

    if(datosDeUsuario.telefono) data.telefono = datosDeUsuario.telefono;
    if(datosDeUsuario.direccion) data.direccion = datosDeUsuario.direccion;
    if(datosDeUsuario.ciudad) data.ciudad = datosDeUsuario.ciudad;
    if(datosDeUsuario.pais) data.pais = datosDeUsuario.pais;

    await this.prisma.usuario.update({
      where: { id },
      data,
    });

    const usuarioActualizado = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        pais: true,
        rol: true,
      },
    });

    return {
      ok: true,
      mensaje: 'Usuario actualizado correctamente',
      usuarioActualizado,
    }
  }

  async borrarUsuario(id: string) {
    try {
      const usuarioEliminado = await this.prisma.usuario.delete({
        where: { id },
      });

      return {
        ok: true,
        mensaje: 'Usuario eliminado correctamente',
        usuario: {
          id: usuarioEliminado.id,
          email: usuarioEliminado.email,
          nombre: usuarioEliminado.nombre,
        },
      };
    } catch (error) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);
    }
  }

  async totalUsuarios() {
  return this.prisma.usuario.count();
}

async obtenerDonacionesDelUsuarioAutenticado( usuarioId: string){
  return await this.prisma.donacion.findMany({
    where: { usuarioId },
    select: {
      id: true,
      monto: true,
      montoARS: true,
      tasaCambio: true,
      fecha: true,
      estadoPago: true,
      stripeSessionId: true,
      referenciaPago: true,
      organizacion: {
        select: { nombre: true},
      },
      mascota: {
        select: {
          nombre: true,
          imagenes: {
            select: { url: true},
          },
          casos: {
            select: { descripcion: true},
          },
        },
      },
    },
  });
}


async obtenerSolicitudesDelUsuario(usuarioId: string){
  return await this.prisma.solicitudDeAdopcion.findMany({
    where: { usuarioId },
    include: {
      casoAdopcion: {
        include: {
          caso: {
            include: {
              mascota: {
                select: {
                  nombre: true,
                  imagenes: {
                    select: { url: true,}
                  },
                },
              },
              ong: {
                select: { nombre: true,}
              },
            },
          },
        },
      },
    },
  });

}

  async toggleFavorito(userId: string, casoId: string) {

    const favorito = await this.prisma.favorito.findUnique({
      where: { usuarioId_casoId: { usuarioId: userId, casoId: casoId } },
    })

    if(favorito){

      await this.prisma.favorito.delete({where: { usuarioId_casoId: { usuarioId: userId, casoId: casoId } }})

      return { message: 'Eliminado de favoritos' };
    }

    await this.prisma.favorito.create({
      data: {usuarioId: userId, casoId: casoId}
    })

    return { message: 'Agregado a favoritos' };

  }

  async obtenerFavoritosDelUsuario(usuarioId: string) {
    return await this.prisma.favorito.findMany({
      where: { usuarioId },
      include: {
        caso: {
          include: {
            mascota: {
              select: { nombre: true, imagenes: { select: { url: true } } },
            },
            ong: {
              select: { nombre: true },
            },
          },
        },
      },
    });
  }
}
