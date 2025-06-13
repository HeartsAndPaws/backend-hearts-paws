import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
}
