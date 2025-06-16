import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';

@Injectable()
export class OrganizacionesService {
  constructor(
    private readonly prisma: PrismaService
  ){}

  async actualizarFotoPerfil(id: string, fotoUrl: string){
    const ongActualizada = this.prisma.organizacion.update({
      where: { id },
      data: { imagenPerfil: fotoUrl},
      select: {
        id: true,
        nombre: true,
        email: true,
        imagenPerfil: true,
        plan: true,
        creado_en: true
      }
    });

    return ongActualizada;
  }

  async crearOrganizacion(data: CreateOrganizacioneDto & {
    archivoVerificacionUrl: string;
    imagenPerfil?: string
  }): Promise<any>{
    const existe = await this.prisma.organizacion.findUnique({
      where: { email: data.email},
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado')
    }

    const contraseñaHash = await bcrypt.hash(data.contrasena, 10);

    const nuevaOrganizacion = await this.prisma.organizacion.create({
      data: {
        ...data,
        contrasena: contraseñaHash,
        archivoVerificacionUrl: data.archivoVerificacionUrl,
        imagenPerfil: data.imagenPerfil ?? null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        creado_en: true,
        archivoVerificacionUrl: true,
        imagenPerfil: true,
      }
    });

    return nuevaOrganizacion;
  }

  async buscarPorId(id: string){
    const organizacion = await this.prisma.organizacion.findUnique({
      where: {id},
      select: {
        id: true,
        nombre: true,
        email: true,
        descripcion: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        pais: true,
        imagenPerfil: true,
        archivoVerificacionUrl: true,
        plan: true,
        creado_en: true,
      },
    });

    if (!organizacion) {
      throw new NotFoundException('Organización no encontrada');
    }
    return organizacion;
  }

  async eliminarPorId(id: string){
    const existe = await this.prisma.organizacion.findUnique({
      where: {id}
    });

    if (!existe) {
      throw new NotFoundException('Organización no encontrada');
    }
    await this.prisma.organizacion.delete({where: {id}})
    return { mensaje: 'Organización eliminada exitosamente' };
  }

  async listarTodas(){
    return this.prisma.organizacion.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        imagenPerfil: true,
        plan: true,
        creado_en: true,
      },
    });
  }

  async actualizarDatosOng(id: string, data: UpdateOrganizacioneDto){
    const existe = await this.prisma.organizacion.findUnique({where: {id}})

    if (!existe) {
      throw new NotFoundException('Organización no encontrada');
    }

    const organizacionActualizada = await this.prisma.organizacion.update({
      where: {id},
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        descripcion: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        pais: true,
        imagenPerfil: true,
        archivoVerificacionUrl: true,
        plan: true,
        creado_en: true,
      },
    });
    
    return organizacionActualizada;
  }
}
