import { Injectable } from '@nestjs/common';
import { SolicitudParaAdoptarDto } from './dtos/solicitud-adoptar.dto';
import { UpdateSolicitudAdoptarDto } from './dtos/update-solicitud-adoptar.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SolicitudAdoptarService {
  constructor(private readonly prisma: PrismaService) {}
  async crearSolicitud(solicitud: SolicitudParaAdoptarDto) {
    const { usuarioId, casoId, estado, tipoVivienda, conQuienVives, hijos, otros, hayOtrasMascotas,
    descripcionOtrasMascotas, cubrirGastos, darAlimentoCuidados, darAmorTiempoEj,
    devolucionDeMascota, siNoPodesCuidarla, declaracionFinal} = solicitud

    const usuarioSolicitante = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId
      },
    });
    if(!usuarioSolicitante){
      throw new Error('Falta el usuario solicitante')
    }
    const nuevaSolicitud = await this.prisma.solicitudDeAdopcion.create({
      data: {
        usuarioId, casoAdopcionId: casoId, estado, tipoVivienda, conQuienVives, hijos, otros, hayOtrasMascotas,
    descripcionOtrasMascotas, cubrirGastos, darAlimentoCuidados, darAmorTiempoEj,
    devolucionDeMascota, siNoPodesCuidarla, declaracionFinal
      },
    });
    return nuevaSolicitud
  }

  async verSolicitudes() {
    return await this.prisma.solicitudDeAdopcion.findMany();

  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudAdoptar`;
  }

  update(id: number, updateSolicitudAdoptarDto: UpdateSolicitudAdoptarDto) {
    return `This action updates a #${id} solicitudAdoptar`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudAdoptar`;
  }
}
