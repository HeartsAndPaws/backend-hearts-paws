import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { TipoMascotaDto } from './dto/tipoMascota.dto';

@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  
    @Get()
    GetMascotas(){

      return this.mascotasService.GetMascotas();

    }

    @Get('mascotas-por-ong-adopcion')
    listaDeMascotasEnAdopcionPorOng(ongId: string){
      return this.mascotasService.mascotasEnAdopcionPorOng(ongId)
    }

    @Get('tipo')
    GetTiposMascotas() {
      return this.mascotasService.GetTipo();
    }

    @Get(':id')
    GetMascotaById(@Param('id') id: string) {
      return this.mascotasService.GetMascotaById(id);
    }

    @Get("ong/:id")
    GetMascotasByOngId(@Param('id') ongId: string) {
      return this.mascotasService.GetMascotasByOngId(ongId);
    }

    @Post("crearTipo")
    CreateTipoMascota(@Body() createTipoMascotaDto: TipoMascotaDto) {
      return this.mascotasService.CreateTipoMascota(createTipoMascotaDto);
    }


    @Post()
    CreateMascota(@Body() createMascotaDto: CreateMascotaDto) {
      return this.mascotasService.CreateMascota(createMascotaDto);
    }

@Post('tipo')
crearTipoDeMascota(@Body() datos: TipoMascotaDto) {
  const { nombre } = datos;
  return this.mascotasService.crearTipoDeMascota(nombre);
}

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
    ) {
      return this.mascotasService.SubirImagenes(mascotaId, archivos);
    }


}
