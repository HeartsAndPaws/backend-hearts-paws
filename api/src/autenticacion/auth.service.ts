import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { NuevoUsuarioDto } from 'src/dtos/NuevoUsuario.dto';

@Injectable()
export class ServicioAuth {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(datosDeUsuario: NuevoUsuarioDto) {
    const hashedPassword = await bcrypt.hash(datosDeUsuario.password, 10);
    datosDeUsuario.password = hashedPassword;
    const { confirmPassword, ...nuevoUsuarioScdc } = datosDeUsuario; // Scdc: Sin confirmacion de contraseña.
    const usuario = await this.prisma.usuario.create({
      data:nuevoUsuarioScdc
    });
    const { password, ...usuarioSc } = usuario; // Sc: Sin contraseña
    return usuarioSc
  }

  async ingreso(email, password) {
    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: { email: email }
    });
    if(!usuarioEncontrado){
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isValidPassword = await bcrypt.compare(password, usuarioEncontrado.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // const hashedPassword = await bcrypt.hash(password, 10)
    // if (!usuarioEncontrado || !(await bcrypt.compare(hashedPassword, usuarioEncontrado.password))) {
    //   throw new UnauthorizedException('Credenciales inválidas');
    // }

    const userPayload = {
      sub: usuarioEncontrado.id,
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol
    };

    const token = this.jwtService.sign(userPayload);

    return { exito: 'Usuario logueado exitosamente', token };
  }
}
