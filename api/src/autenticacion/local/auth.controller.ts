import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServicioAut } from './auth.service';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { DatosDeIngresoDto } from 'src/autenticacion/dtos/DatosDeIngreso.dto';
import { DatosIngresoOrganizacionDto } from '../dtos/DatosIngresoOrganizacionDto';
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { NuevaOrganizacionDto } from '../dtos/NuevaOrganizacion';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


import { JwtAutCookiesGuardia } from '../guardias/jwtAut.guardia';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly servicioAuth: ServicioAut,
        private readonly cloudinaryService: CloudinaryService
    ) {}


  @Post('usuarios/ingreso')
  @HttpCode(200)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Ingreso de usuario' })
  @ApiOkResponse({ description: 'Usuario autenticado exitosamente' })
  @ApiBody({ type: DatosDeIngresoDto })

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
        return { mensaje: respuesta.ok }

    }
  }


  @Post('cerrarSesion')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('authToken');
    return { message: 'Sesión cerrada' };
  }


  @Post('organizaciones/ingreso')
  @HttpCode(200)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Ingreso de organización' })
  @ApiOkResponse({ description: 'Organización autenticada exitosamente' })
  @ApiBody({ type: DatosIngresoOrganizacionDto })
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


  @Post('registro')
  @HttpCode(201)
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'imagenPerfil', maxCount: 1},
  ]))

  @ApiOperation({ summary: 'Registro de nuevo usuario' })

  @ApiCreatedResponse({ description: 'Usuario creado exitosamente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  description: 'Formulario con datos del usuario y una imagen opcional',
  schema: {
    type: 'object',
    properties: {
      nombre: { type: 'string', example: 'Juan Pérez' },
      email: { type: 'string', format: 'email', example: 'juan@example.com' },
      contrasena: { type: 'string', minLength: 8, example: 'Contrasena123!' },
      telefono: { type: 'string', example: '3201234567' },
      direccion: { type: 'string', example: 'Calle 123 #45-67' },
      ciudad: { type: 'string', example: 'Bogotá' },
      pais: { type: 'string', example: 'Colombia' },
      imagenPerfil: {
        type: 'string',
        format: 'binary',
      },
    },
    required: ['nombre', 'email', 'contrasena', 'telefono', 'direccion', 'ciudad', 'pais'],
  },
})
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imagenPerfil', maxCount: 1 }]),
  )
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

  @Post('registro-ong')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'archivoVerificacionUrl', maxCount: 1},
    {name: 'imagenPerfil', maxCount: 1},
  ]))
  @ApiOperation({ summary: 'Registro de organización con archivo y foto' })
  @ApiCreatedResponse({ description: 'Organización creada exitosamente' })
  @ApiBody({
  description: 'Formulario con datos de la organización, PDF y una imagen opcional',
  type: 'object',
  required: true,
  schema: {
    type: 'object',
    properties: {
      nombre: { type: 'string' },
      email: { type: 'string', format: 'email' },
      contrasena: { type: 'string', minLength: 6 },
      descripcion: { type: 'string' },
      telefono: { type: 'string' },
      direccion: { type: 'string' },
      ciudad: { type: 'string' },
      pais: { type: 'string' },
      archivoVerificacionUrl: {
        type: 'string',
        format: 'binary',
      },
      imagenPerfil: {
        type: 'string',
        format: 'binary',
      },
    },
    required: [
      'nombre',
      'email',
      'contrasena',
      'descripcion',
      'telefono',
      'direccion',
      'ciudad',
      'pais',
      'archivoVerificacionUrl',
    ],
  },
})
  @ApiConsumes('multipart/form-data')
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
