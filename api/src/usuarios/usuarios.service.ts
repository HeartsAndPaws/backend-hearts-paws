import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class UsuariosService {
  constructor( private readonly prisma: PrismaService){}

  async actualizarFotoPerfil(id: string, fotoUrl: string){
    return this.prisma.usuario.update({
      where: { id },
      data: { imagenPerfil: fotoUrl}
    });
  }
}
