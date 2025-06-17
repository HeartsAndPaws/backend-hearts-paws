import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsuariosService {
  constructor( private readonly prisma: PrismaService){}

  

  async actualizarFotoPerfil(id: string, fotoUrl: string){
    return this.prisma.usuario.update({
      where: { id },
      data: { imagenPerfil: fotoUrl}
    });
  }

    async usuarioPorId(id: string) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
        },
      });
  
      if (!usuario) {
        throw new NotFoundException(`No se encontró el usuario con id ${id}`);
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
        // No incluir contraseñas ni otros campos sensibles
      },
    });
    return usuarios;
  }


  async cambiarContrasena(id: string, nuevaContrasena: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);
    }

    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);

    await this.prisma.usuario.update({
      where: { id },
      data: { contrasena: contrasenaEncriptada },
    });

    return { ok: true, mensaje: 'Contraseña actualizada correctamente' };
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
