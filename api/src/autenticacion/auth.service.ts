import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
}
