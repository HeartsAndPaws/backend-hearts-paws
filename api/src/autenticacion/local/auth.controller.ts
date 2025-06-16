import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';
import { DatosIngresoOrganizacionDto } from '../dtos/DatosIngresoOrganizacionDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly servicioAuth: ServicioAuth) {}

  @Post('usuarios/ingreso')
  @HttpCode(200)
  async ingreso(@Body() datos: DatosDeIngresoDto) {
    const { email, contrasena } = datos;

    if (!email || !contrasena) {
      throw new BadRequestException('Las credenciales son necesarias');
    }

    return await this.servicioAuth.ingreso(email, contrasena);
  }

  @Post('organizaciones/ingreso')
  @HttpCode(200)
  async ingresoOrganizacion(
    @Body() datos: DatosIngresoOrganizacionDto
  ){
    const { email, contrasena } = datos;

    if (!email || !contrasena) {
      throw new BadRequestException('Las credenciales son necesarias');
    }

    return await this.servicioAuth.ingresoOrganizacion(email, contrasena);
  }


  @Post('registro')
  @HttpCode(201)
  async registro(@Body() datosDeUsuario: NuevoUsuarioDto) {
    if (!datosDeUsuario) {
      throw new BadRequestException('Faltan datos');
    }

    const nuevoUsuario = await this.servicioAuth.registro(datosDeUsuario);

    return {
      ok: true,
      mensaje: 'Usuario registrado con éxito',
      usuario: nuevoUsuario,
    };
  }

  @Get('usuarios')
  async obtenerUsuarios() {
    return await this.servicioAuth.listaDeUsuarios();
  }

  @Get('usuarios/:id')
  async obtenerUsuarioPorId(@Param('id', ParseUUIDPipe) id: string) {
    const usuario = await this.servicioAuth.usuarioPorId(id);

    return usuario; // ya lanza NotFoundException si no existe
  }

  @Patch('usuarios/:id/contrasena')
  async cambiarContrasena(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { nuevaContrasena: string },
  ) {
    const { nuevaContrasena } = body;

    if (!nuevaContrasena) {
      throw new BadRequestException('Debe proporcionar una nueva contraseña');
    }

    if (nuevaContrasena.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    const resultado = await this.servicioAuth.cambiarContrasena(id, nuevaContrasena);

    return resultado;
  }

  @Delete('usuarios/:id')
  async borrarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return await this.servicioAuth.borrarUsuario(id);
  }
}
