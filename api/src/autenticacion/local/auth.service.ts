import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';

@Injectable()
export class ServicioAuth {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(datosDeUsuario: NuevoUsuarioDto) {
    const siElEmailEstaRegistrado = await this.prisma.usuario.findUnique({
      where: { email: datosDeUsuario.email },
    });

    if (siElEmailEstaRegistrado) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(datosDeUsuario.contrasena, 10);
    datosDeUsuario.contrasena = hashedPassword;

    const usuario = await this.prisma.usuario.create({
      data: datosDeUsuario,
    });

    const { contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  async ingreso(email: string, contrasena: string) {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuarioEncontrado) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isValidPassword = await bcrypt.compare(
      contrasena,
      usuarioEncontrado.contrasena,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userPayload = {
      sub: usuarioEncontrado.id,
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol,
    };

    const token = this.jwtService.sign(userPayload);

    return { ok: 'Usuario logueado exitosamente', token };
  }

  async ingresoOrganizacion(email: string, contrasena: string){
    const organizacion = await this.prisma.organizacion.findUnique({where: {email}});

    if (!organizacion) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isValidPassword = await bcrypt.compare(contrasena, organizacion.contrasena);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: organizacion.id,
      id: organizacion.id,
      email: organizacion.email,
      plan: organizacion.plan
    };

    const token = this.jwtService.sign(payload);
    return {
      ok: 'Organización logueada exitosamente',
      token,
    }
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
