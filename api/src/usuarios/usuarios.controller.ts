import { Controller, Post, Param, UseInterceptors, UploadedFile, Get, ParseUUIDPipe, UseGuards, Req, Patch, Body, BadRequestException, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ActualizarUsuarioDTO } from 'src/usuarios/dto/ActualizarUsuario.dto';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente' })
  async obtenerUsuarios() {
  return await this.usuariosService.listaDeUsuarios();
}


@UseGuards(AuthGuard(['jwt-local', 'supabase']))
@Get('me')
@ApiBearerAuth()
@ApiOperation({ summary: 'Obtener el usuario autenticado' })
@ApiResponse({ status: 200, description: 'Usuario actual retornado exitosamente' })
async getUsuarioActual(@Req() req){
  return await this.usuariosService.usuarioPorId(req.user.id, req.user.external)
}

  @UseGuards(AuthGuard(['jwt-local', 'supabase']))
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async obtenerUsuarioPorId(@Param('id', ParseUUIDPipe) id: string) {
    const usuario = await this.usuariosService.usuarioPorId(id);
    return usuario; // ya lanza NotFoundException si no existe
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Cambia los datos del usuario' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    type: ActualizarUsuarioDTO
  })
  @ApiResponse({ status: 200, description: 'Datos actualizados' })
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datosDeUsuario: ActualizarUsuarioDTO,
  ) {
    const resultado = await this.usuariosService.actualizarUsuario(id, datosDeUsuario);
    return resultado;
  }



  @Delete(':id')
  @UseGuards(AuthGuard(['jwt-local', 'supabase']))
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  async borrarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usuariosService.borrarUsuario(id);
  }


  @Post(':id/foto')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: filtroArchivoImagen,
    limits: limits
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imagen de perfil del usuario' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil actualizada correctamente' })
  async subirFotoPerfil(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ){
    const subirImagen = await this.cloudinaryService.subirIamgen(file);
    return this.usuariosService.actualizarFotoPerfil(id, subirImagen.secure_url)
  }

}
