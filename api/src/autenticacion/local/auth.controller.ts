import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';

@Controller('autenticacion')
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
}
