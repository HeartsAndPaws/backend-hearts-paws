import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ActualizarUsuarioDTO } from './dto/ActualizarUsuario.dto';


@Injectable()
export class UsuariosService {
  constructor( private readonly prisma: PrismaService){}

  

  async actualizarFotoPerfil(id: string, fotoUrl: string){
    const usuario = await this.prisma.usuario.findUnique({where: {id}});

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con id ${ id }`);
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
        },
      });
  
      if (!usuario) {
        throw new NotFoundException(`No se encontró el usuario con ${external ? 'externalId' : 'id'} ${id}`);
      }
  
      return usuario;
    }

      async listaDeUsuarios() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        imagenPerfil: true,
        // No incluir contraseñas ni otros campos sensibles
      },
    });
    return usuarios;
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
}
