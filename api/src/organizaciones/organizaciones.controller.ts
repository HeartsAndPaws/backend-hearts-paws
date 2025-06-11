import { Controller, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';


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
}
