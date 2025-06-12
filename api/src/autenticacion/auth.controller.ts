import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/dtos/DatosDeIngreso.dto';

@Controller('auth')
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
    const comparePasswords = datosDeUsuario.password === datosDeUsuario.confirmPassword
    
    if(comparePasswords){ // Se pueden agregar mas validaciones a ésta línea
      return this.servicioAuth.registro(datosDeUsuario)
    }else if(datosDeUsuario && !comparePasswords){
      throw new BadRequestException('Las contraseñas deben ser iguales')
    }else {
      throw new BadRequestException('Faltan datos')
    }
  }
}
