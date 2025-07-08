import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFiles, UseGuards, Req } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { TipoMascotaDto } from './dto/tipoMascota.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/autenticacion/guards/roles.guard';
import { Roles } from 'src/autenticacion/decoradores/roles.decorator';
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get()
  GetMascotas(){
    return this.mascotasService.GetMascotas();
  }

  @UseGuards(AuthGuard('jwt-local'))
  @Get('mascotas-por-ong-adopcion')
  listaDeMascotasEnAdopcionPorOng(@Req() req: AuthenticateRequest){
    const ongId = req.user.id;
    return this.mascotasService.mascotasEnAdopcionPorOng(ongId)
  }


  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Roles('ADMIN')
  @Get('total')
  async contarTotalMascotas(){
    return await this.mascotasService.contarMascotas();
  }

  @UseGuards(AuthGuard(['jwt-local', 'supabase']), RolesGuard)
  @Get('tipo')
  GetTiposMascotas() {
    return this.mascotasService.GetTipo();
  }

  @UseGuards(AuthGuard('jwt-local'))
  @Get("ong")
  GetMascotasByOngId(@Req() req: AuthenticateRequest) {
    console.log('Usuario autenticado:', req.user); 
    const ongId = req.user.id;
    return this.mascotasService.GetMascotasByOngId(ongId);
  }

  @Get(':id')
  GetMascotaById(@Param('id') id: string) {
    return this.mascotasService.GetMascotaById(id);
  }

  @Post("crearTipo")
  CreateTipoMascota(@Body() createTipoMascotaDto: TipoMascotaDto) {
    return this.mascotasService.CreateTipoMascota(createTipoMascotaDto);
  }

    
  @UseGuards(AuthGuard('jwt-local'))
  @Post()
  CreateMascota(
    @Req() req: AuthenticateRequest,
    @Body() createMascotaDto: CreateMascotaDto) {
      const ongId = req.user.id;
      return this.mascotasService.CreateMascota(createMascotaDto, ongId);
  }


  @UseGuards(AuthGuard('jwt-local'))
  @Post('tipo')
  crearTipoDeMascota(
    @Body() datos: TipoMascotaDto,
    @Req() req: AuthenticateRequest
  ) {
    const { nombre } = datos;
    return this.mascotasService.crearTipoDeMascota(nombre);
  }


  @UseGuards(AuthGuard('jwt-local'))
  @Post(':id/imagenes')
  @UseInterceptors(FilesInterceptor('imagenes'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  schema: {
    type: 'object',
    properties: {
      imagenes: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
  async subirImagenes(
    @Param('id') mascotaId: string,
    @UploadedFiles() archivos: Express.Multer.File[],
    @Req() req: AuthenticateRequest
  ) {
    const ongId = req.user.id;
    return this.mascotasService.SubirImagenes(mascotaId, archivos, ongId);
  }
}
