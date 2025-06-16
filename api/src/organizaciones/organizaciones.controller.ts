import { Controller, Post, Param, UseInterceptors, UploadedFile, UploadedFiles, Body, BadRequestException, Get, Patch, Delete } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';


@Controller('organizaciones')
export class OrganizacionesController {
  constructor(
    private readonly organizacionesService: OrganizacionesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/foto')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: filtroArchivoImagen,
    limits: limits
  }))
  async subirFotoPerfil(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ){
    const subirImagen = await this.cloudinaryService.subirIamgen(file);
    return this.organizacionesService.actualizarFotoPerfil(id, subirImagen.secure_url);
  }

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
    @Body() data: CreateOrganizacioneDto,
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


    return this.organizacionesService.crearOrganizacion({
      ...data,
      archivoVerificacionUrl: secure_url,
      imagenPerfil: imagenPerfilUrl
    })
  }

  @Get()
  async obtenerTodas() {
    return this.organizacionesService.listarTodas();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.organizacionesService.buscarPorId(id);
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() data: UpdateOrganizacioneDto,
  ) {
    return this.organizacionesService.actualizarDatosOng(id, data);
  }


  // se debe configurar para que pueda eliminarse en cascada, ya que ong tiene relaciones con mascotas.
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.organizacionesService.eliminarPorId(id);
  }
}
