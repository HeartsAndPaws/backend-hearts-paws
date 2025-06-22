import { Controller, Post, Param, UseInterceptors, UploadedFile, UploadedFiles, Body, BadRequestException, Get, Patch, Delete, UseGuards, Req, ParseUUIDPipe, Res } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';
import { EstadoOrganizacion } from '@prisma/client';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtAutCookiesGuardia } from 'src/autenticacion/guards/jwtAut.guardia';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';



@ApiTags('Organizaciones')
@Controller('organizaciones')
export class OrganizacionesController {
  constructor(
    private readonly organizacionesService: OrganizacionesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}


  @Get()
  @ApiOperation({ summary: 'Obtener todas las organizaciones' })
  @ApiResponse({ status: 200, description: 'Lista de organizaciones' })
  async obtenerTodas() {
    return this.organizacionesService.listarTodas();
  }


  @UseGuards(JwtAutCookiesGuardia)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener organización autenticada' })
  @ApiResponse({ status: 200, description: 'Datos de la organización actual' })
  async getOrganizacionActual(@Req() req){
    return await this.organizacionesService.buscarPorId(req.user.id)
  }


  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID de la organización' })
  @ApiResponse({ status: 200, description: 'Organización encontrada' })
  async obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizacionesService.buscarPorId(id);
  }

<<<<<<< HEAD
  @Get('casosPorOng/:id')
  async casosPorOng(@Param('id') id: string){
    return this.organizacionesService.buscarCasosPorOng(id)
  }

=======
  
>>>>>>> b6a68598644e760da79fac4c4e112a4a9b7678b2
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una organización' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Organización actualizada' })
  async actualizar(
    @Param('id') id: string,
    @Body() data: UpdateOrganizacioneDto,
  ) {
    return this.organizacionesService.actualizarDatosOng(id, data);
  }


  @Patch(':id/estado')
  @UseInterceptors(AnyFilesInterceptor())
<<<<<<< HEAD
  // @UseGuards(JwtAutCookiesGuardia, RolesGuard)
  // @Roles('ADMIN')
=======
  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
>>>>>>> b6a68598644e760da79fac4c4e112a4a9b7678b2
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar estado de una organización (solo ADMIN)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: EstadoOrganizacion // 'APROBADA' o 'RECHAZADA'
  ){
    return this.organizacionesService.actualizarEstado(id, estado);
  }


  @Post(':id/foto')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: filtroArchivoImagen,
    limits: limits
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto de perfil de la organización' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil actualizada' })
  async subirFotoPerfil(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ){
    const subirImagen = await this.cloudinaryService.subirIamgen(file);
    return this.organizacionesService.actualizarFotoPerfil(id, subirImagen.secure_url);
  }

  @Get(':id/archivo-verificacion')
  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  async obtenerArchivoPdf(@Param('id') id: string, @Res() res: Response){
    return this.organizacionesService.servirArchivoVerificacion(id, res);
  }


}
