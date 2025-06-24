import { Result } from './../../node_modules/peberminta/lib/core.d';
import { Injectable, Get } from '@nestjs/common';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TipoMascotaDto } from './dto/tipoMascota.dto';

@Injectable()
export class MascotasService {
  
  constructor(private readonly prismaService: PrismaService, private readonly cloudinaryService: CloudinaryService){}
  
  
  
  async GetMascotas() {
    
    return this.prismaService.mascota.findMany({
      include: {
        imagenes: true,
      },
    });

    
  }

  async GetMascotaById(id: string) {
      
    return this.prismaService.mascota.findUnique({
      where: { id },
      include: {
        imagenes: true,
      },
    });
  }

  async GetMascotasByOngId(ongId: string) {
    
    return this.prismaService.mascota.findMany({
      where: { organizacionId: ongId },
      include: {
        imagenes: true,
      },
    });
  }

  async GetTipo(){

    return await this.prismaService.tiposMascota.findMany();

  }
  async CreateTipoMascota(createTipoMascotaDto: TipoMascotaDto) {
    return this.prismaService.tiposMascota.create({
      data: {
        nombre: createTipoMascotaDto.nombre,
      },
    });
  }

 async crearTipoDeMascota(nombre: string) {
  return this.prismaService.tiposMascota.create({
    data: {
      nombre: nombre.toUpperCase(),
    },
  });
}

  async CreateMascota(createMascotaDto: CreateMascotaDto) {
    
    return this.prismaService.mascota.create({
      data: createMascotaDto,
      include: {
        imagenes: true,
        tipo: true
      },
    });
  
  }

  async SubirImagenes(mascotaId: string, archivos: Express.Multer.File[]) {

    const imagenes: any = []

    for(const file of archivos){

      const result = await this.cloudinaryService.subirIamgen(file);
      const imagen = await this.prismaService.imagenMascota.create({
        data: {

          url: result.secure_url,
          mascotaId,

        },
      });

      imagenes.push(imagen);

    }

    return imagenes;
  }
  
}
