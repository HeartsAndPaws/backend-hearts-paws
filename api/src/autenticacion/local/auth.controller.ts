import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';

@Controller('autLocal')
export class AuthController {
    constructor(
        private readonly servicioAuth: ServicioAuth
    ) {}

  @Post('ingreso')
  ingreso(@Body() datos: DatosDeIngresoDto){
    const { email, password } = datos
    if(!email || !password){
      return 'Las credenciales son necesarias'
    }else{
      return this.servicioAuth.ingreso(email, password)
    }
  }

  @Post('registro')
  @HttpCode(201)
  async registro(@Body() datosDeUsuario:NuevoUsuarioDto){
    
    if(datosDeUsuario){ // Se pueden agregar mas validaciones a ésta línea
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

  @Delete('usuarios/:id')
  async borrarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return await this.servicioAuth.borrarUsuario(id);
  }
}
