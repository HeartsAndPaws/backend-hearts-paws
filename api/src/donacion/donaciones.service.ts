import { Get, Injectable, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAutCookiesGuardia } from 'src/autenticacion/guards/jwtAut.guardia';
import { NuevaDonacionDto } from './dtos/nuevaDonacion.dto';

@Injectable()
export class DonacionService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async donar(datos: NuevaDonacionDto){
        const { usuarioId, organizacionId, mascotaId, monto, comprobante} = datos
        const organizacion = await this.prisma.organizacion.findUnique({
  where: { id: organizacionId },
});
    if(!organizacion){
        throw new Error("La organizacion no existe")
    }
        
        const nuevaDonacion = this.prisma.donacion.create({
            data: {
                usuarioId,
                organizacionId,
                mascotaId,
                monto,
                comprobante
            }
    });
    return nuevaDonacion
    }

    @Get(':ongId')
    async verDonacionesPorOng(@Param('ongId') ongId: string) {
      const donacionesDeLaOng = await this.prisma.organizacion.findUnique({
        where: {
          id: ongId,
        },
      });
      return donacionesDeLaOng
}
}
