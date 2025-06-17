import { Controller, Post, Param, UseInterceptors, UploadedFile, Get, ParseUUIDPipe, UseGuards, Req, Patch, Body, BadRequestException, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { JwtAuthguard } from 'src/autenticacion/guards/jwt-auth.guard';


@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService
  ) {}
  
  // GET /usuarios
  @Get()
  async obtenerUsuarios() {
  return await this.usuariosService.listaDeUsuarios();
}

// GET /usuarios/me
@UseGuards(JwtAuthguard)
@Get('me')
async getUsuarioActual(@Req() req){
  console.log('Decoded token info:', req.user);
  return await this.usuariosService.usuarioPorId(req.user.id)
}

  // GET /usuarios/:id
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id', ParseUUIDPipe) id: string) {
    const usuario = await this.usuariosService.usuarioPorId(id);
    return usuario; // ya lanza NotFoundException si no existe
  }


  // PATCH /usuarios/:id/contrasena
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

    const resultado = await this.usuariosService.cambiarContrasena(id, nuevaContrasena);

    return resultado;
  }


  // DELETE /usuarios/:id
  @Delete('usuarios/:id')
  async borrarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usuariosService.borrarUsuario(id);
  }

  // POST /usuarios/:id/foto
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
