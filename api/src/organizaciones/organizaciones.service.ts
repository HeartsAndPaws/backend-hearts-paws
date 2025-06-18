import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';
import { ok } from 'assert';
import { EstadoOrganizacion } from '@prisma/client';

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


  async listarTodas(){
    return this.prisma.organizacion.findMany({
      where: { estado: 'APROBADA'},
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

  async actualizarEstado(id: string, estado: EstadoOrganizacion){
    const organizacion = await this.prisma.organizacion.findUnique({where: {id}});
    if (!organizacion) {
      throw new NotFoundException('Organización no encontrada');
    }

    const actualizada = await this.prisma.organizacion.update({
      where: {id},
      data: { estado}
    });

    // implementar logica para enviar correo

    return {
      ok: true,
      mensaje: `Estado actualizado a ${estado}`,
      organizacion: actualizada,
    };
  }
}
