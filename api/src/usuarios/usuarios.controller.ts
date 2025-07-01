import { Controller, Post, Param, UseInterceptors, UploadedFile, Get, ParseUUIDPipe, UseGuards, Req, Patch, Body, BadRequestException, Delete, Query, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ActualizarUsuarioDTO } from 'src/usuarios/dto/ActualizarUsuario.dto';
import { AuthGuard } from '@nestjs/passport';
import { Rol } from '@prisma/client';
import { Request } from 'express';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';


@ApiTags('Usuarios')
@UseGuards(AuthGuard(['jwt-local', 'supabase']) ,RolesGuard)
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente' })
  async obtenerUsuarios(
    @Query('rol') rol: Rol, 
    @Query('pais') pais: string,
    @Query('email') email: string,
    @Query('nombre') nombre: string
  ) {
  return await this.usuariosService.listaDeUsuarios( {rol, pais, email, nombre} );
}


  @Get('estadisticas/total')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener total de usuarios' })
  async totalUsuarios() {
    const total = await this.usuariosService.totalUsuarios();
    return { total };
  }


  @Get('mis-donaciones')
  @ApiOperation({summary: 'ver mis donaciones'})
  async obtenerMisDonaciones(@Req() req: Request){
    const usuario = req.user as any;
    return await this.usuariosService.obtenerDonacionesDelUsuarioAutenticado(usuario.id);
  }

  @Get('mis-solicitudes')
  @ApiOperation({ summary: 'Ver mis solicitudes de adopción'})
  async obtenerMisSolicitudes(@Req() req: Request){
    const usuario = req.user as any;
    return await this.usuariosService.obtenerSolicitudesDelUsuario(usuario.id);
  }


  @Get('me')
  @ApiOperation({ summary: 'Obtener el usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Usuario actual retornado exitosamente' })
  async getUsuarioActual(@Req() req){
    return await this.usuariosService.usuarioPorId(req.user.id, req.user.external)
  }


  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async obtenerUsuarioPorId(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usuariosService.usuarioPorId(id);
  }


  @Get('favoritos/casos/:usuarioId')
  obetnerFavoritos(@Param('usuarioId') usuarioId: string){
    return this.usuariosService.obtenerFavoritosDelUsuario(usuarioId)
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Cambia los datos del usuario' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ActualizarUsuarioDTO })
  @ApiResponse({ status: 200, description: 'Datos actualizados' })
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datosDeUsuario: ActualizarUsuarioDTO,
  ) {
    return await this.usuariosService.actualizarUsuario(id, datosDeUsuario);
  }


  @Delete(':id')
  @Roles('ADMIN')
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

  @Put(':userId/favoritos/:casoId')
  toggleFavorito(@Param('userId', ParseUUIDPipe) userId: string, @Param('casoId', ParseUUIDPipe) casoId: string) {
    return this.usuariosService.toggleFavorito(userId, casoId);

  }
}
