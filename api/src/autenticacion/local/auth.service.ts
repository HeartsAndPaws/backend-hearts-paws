import { Delete, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
    })
    if(siElEmailEstaRegistrado){
      return false
    } else {
      const hashedPassword = await bcrypt.hash(datosDeUsuario.contrasena, 10);
      datosDeUsuario.contrasena = hashedPassword;
      const usuario = await this.prisma.usuario.create({
        data:datosDeUsuario
      });
      const { contrasena, ...usuarioSc } = usuario; // Sc: Sin contraseña
      return usuarioSc
    }
  }

  async ingreso(email, password) {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: { email: email }
    });
    if(!usuarioEncontrado){
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isValidPassword = await bcrypt.compare(password, usuarioEncontrado.contrasena);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userPayload = {
      sub: usuarioEncontrado.id,
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol
    };

    const token = this.jwtService.sign(userPayload);
    
    return { ok: 'Usuario logueado exitosamente', token };
  }

  async listaDeUsuarios(){
    const usuarios = await this.prisma.usuario.findMany()

    return usuarios
  }
  
  async usuarioPorId(id: string){
    const usuario = await this.prisma.usuario.findUnique({where: { id }})
    if(usuario){
      return usuario
    } else {
      return false
    }
  }

  async cambiarContrasena(id: string, nuevaContrasena: string){
    const usuario = await this.prisma.usuario.findUnique({where: { id }})
    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);
    if(!usuario){
      return false
    } else {
      await this.prisma.usuario.update({
        where: { id },
        data: {
          contrasena: contrasenaEncriptada
        }
      })
      return true
    }
  }
  async borrarUsuario(id:string){
      try {
    const usuarioEliminado = await this.prisma.usuario.delete({
      where: { id },
    });

    return {
      ok: true,
      mensaje: 'Usuario eliminado correctamente',
      usuario: usuarioEliminado,
    };
  } catch (error) {
    throw new NotFoundException(`No se encontró el usuario con id ${id}`);
  }
  }
  }

