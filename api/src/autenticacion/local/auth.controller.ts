import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';
import { JwtAutCookiesGuardia } from '../guards/jwtAut.guardia';

@Controller('autLocal')
export class AuthController {
    constructor(
        private readonly servicioAuth: ServicioAuth
    ) {}

    @Post('ingreso')
    async ingreso(@Res({ passthrough: true }) res: Response, @Body() credenciales: DatosDeIngresoDto){
      const { email, contrasena } = credenciales
      if(!email || !contrasena){
        return 'Las credenciales son necesarias'
      }else{
        const respuesta = await this.servicioAuth.ingreso(email, contrasena)
        const token = respuesta.token
          res.cookie('authToken', token, {
            httpOnly: true, 
            sameSite: 'lax',
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
  });
        return { mensaje: respuesta.mensaje}
    }
  }

  @Post('cerrarSesion')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('authToken');
    return { message: 'Sesión cerrada' };
    }

  @Post('registro')
  @HttpCode(201)
  async registro(@Body() datosDeUsuario:NuevoUsuarioDto){
    
    if(datosDeUsuario){
      
      const exito = await this.servicioAuth.registro(datosDeUsuario)
      if(exito){
        return {
          ok: true,
          mensaje: "Usuario registrado con éxito"
        }
      }else{
        return {
          ok: false,
          mensaje: "El email ya está registrado"
        }
      }
    }else {
      throw new BadRequestException('Faltan datos')
    }
  }
  
  @Get()
  async obtenerUsuarios() {
    const usuarios = await this.servicioAuth.listaDeUsuarios();
    return usuarios
  }

  @UseGuards(JwtAutCookiesGuardia)
  @Get('usuarios/:id')
  async obtenerUsuarioPorId(@Param('id', ParseUUIDPipe) id: string) {
    const usuario = await this.servicioAuth.usuarioPorId(id);
    if (!usuario) {
      return {
        ok: false,
        mensaje: 'Usuario no encontrado',
      };
    }
    return usuario;
  }

  @UseGuards(JwtAutCookiesGuardia)
  @Patch('nuevaContrasena')
  async cambiarContrasena(
  @Body() body: { id: string; nuevaContrasena: string }
) {
  const { id, nuevaContrasena } = body;

  if (!id || !nuevaContrasena) {
    throw new BadRequestException('Se requieren el id y la nueva contraseña');
  }

  if (nuevaContrasena.length < 8) {
    throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
  }

  const resultado = await this.servicioAuth.cambiarContrasena(id, nuevaContrasena);
  
  if (!resultado) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return { ok: true, mensaje: 'Contraseña actualizada correctamente' };
}

  @UseGuards(JwtAutCookiesGuardia)
  @Delete('usuarios/:id')
  async borrarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return await this.servicioAuth.borrarUsuario(id);
  }
}
