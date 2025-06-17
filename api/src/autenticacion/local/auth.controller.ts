import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ServicioAuth } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';
import { DatosIngresoOrganizacionDto } from '../dtos/DatosIngresoOrganizacionDto';
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { NuevaOrganizacionDto } from '../dtos/NuevaOrganizacion';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly servicioAuth: ServicioAuth,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // INGRESO USUARIOS ===
  // POST /usuarios/ingreso
  @Post('usuarios/ingreso')
  @HttpCode(200)
  @UseInterceptors(AnyFilesInterceptor())
  async ingreso(
    @Res({passthrough: true}) res: Response,
    @Body() datos: DatosDeIngresoDto) {
    const { email, contrasena } = datos;

    if (!email || !contrasena) {
      throw new BadRequestException('Las credenciales son necesarias');
    }

    const respuesta = await this.servicioAuth.ingreso(email, contrasena);
    const token = respuesta.token
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    });

    return respuesta.ok;
  }

  // === INGRESO ORGANIZACIONES ===
  // POST /organizaciones/ingreso
  @Post('organizaciones/ingreso')
  @HttpCode(200)
  @UseInterceptors(AnyFilesInterceptor())
  async ingresoOrganizacion(
    @Res({passthrough: true}) res: Response,
    @Body() datos: DatosIngresoOrganizacionDto
  ){
    const { email, contrasena } = datos;

    if (!email || !contrasena) {
      throw new BadRequestException('Las credenciales son necesarias');
    }

    const respuesta = await this.servicioAuth.ingresoOrganizacion(email, contrasena);
    const token = respuesta.token
    res.cookie('authToken', token, {
      httpOnly:true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    });

    return respuesta.ok;
  
  }

  // ==== REGISTRO USUARIOS ===
  // POST /registro
  @Post('registro')
  @HttpCode(201)
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'imagenPerfil', maxCount: 1},
  ]))
  async registro(
    @UploadedFiles() files: {
      imagenPerfil?: Express.Multer.File[],
    },
    @Body() datosDeUsuario: NuevoUsuarioDto) {
      
      const imagenPerfil = files?.imagenPerfil?.[0];
      let imagenPerfilUrl: string | undefined = undefined;

      if (imagenPerfil) {
        imagenPerfilUrl = (await this.cloudinaryService.subirIamgen(imagenPerfil)).secure_url;
      }

    if (!datosDeUsuario) {
      throw new BadRequestException('Faltan datos');
    }

    return this.servicioAuth.registro({
      ...datosDeUsuario,
      imagenPerfil: imagenPerfilUrl
    })


  }

  // === REGISTRO ORGANIZACIONES ===
  // POST /registro-ong
  @Post('registro-ong')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'archivoVerificacionUrl', maxCount: 1},
    {name: 'imagenPerfil', maxCount: 1},
  ]))
  async crearOrganizacion(
    @UploadedFiles() files: {
      archivoVerificacionUrl?: Express.Multer.File[],
      imagenPerfil?: Express.Multer.File[],
    },
    @Body() data: NuevaOrganizacionDto,
  ){
    const archivoVerificacion = files?.archivoVerificacionUrl?.[0];
    const imagenPerfil = files?.imagenPerfil?.[0];

    if (!archivoVerificacion) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    if (archivoVerificacion.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser PDF')
    }

    const { secure_url } = await this.cloudinaryService.subirPdf(archivoVerificacion);

    let imagenPerfilUrl: string | undefined = undefined;
    if (imagenPerfil) {
      imagenPerfilUrl = (await this.cloudinaryService.subirIamgen(imagenPerfil)).secure_url;
    }


    return this.servicioAuth.crearOrganizacion({
      ...data,
      archivoVerificacionUrl: secure_url,
      imagenPerfil: imagenPerfilUrl
    })
  }


}
