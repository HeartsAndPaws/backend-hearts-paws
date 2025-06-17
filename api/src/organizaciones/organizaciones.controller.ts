import { Controller, Post, Param, UseInterceptors, UploadedFile, UploadedFiles, Body, BadRequestException, Get, Patch, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { filtroArchivoImagen, limits } from 'src/cloudinary/file.interceptor';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';
import { EstadoOrganizacion } from '@prisma/client';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtAuthguard } from 'src/autenticacion/guards/jwt-auth.guard';


@Controller('organizaciones')
export class OrganizacionesController {
  constructor(
    private readonly organizacionesService: OrganizacionesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // GET /organizaciones
  @Get()
  async obtenerTodas() {
    return this.organizacionesService.listarTodas();
  }

  // GET /organizaciones/:id
  @UseGuards(JwtAuthguard)
  @Get('me')
  async getOrganizacionActual(@Req() req){
    return await this.organizacionesService.buscarPorId(req.user.id)
  }

  // GET /organizaciones/:id
  @Get(':id')
  async obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizacionesService.buscarPorId(id);
  }

  // PATCH /organizaciones/:id
  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() data: UpdateOrganizacioneDto,
  ) {
    return this.organizacionesService.actualizarDatosOng(id, data);
  }

  // PATCH /organizaciones/:id/estado
  @Patch(':id/estado')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(JwtAuthguard, RolesGuard)
  @Roles('ADMIN')
  async cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: EstadoOrganizacion // 'APROBADA' o 'RECHAZADA'
  ){
    return this.organizacionesService.actualizarEstado(id, estado);
  }

  // POST /organizaciones/:id/foto
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
