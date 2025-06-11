import { Controller, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';


@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService
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
    return this.usuariosService.actualizarFotoPerfil(id, subirImagen.secure_url)
  }

}
