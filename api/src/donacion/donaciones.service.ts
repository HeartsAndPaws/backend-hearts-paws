import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAutCookiesGuardia } from 'src/autenticacion/guards/jwtAut.guardia';
import { NuevaDonacionDto } from './dtos/nuevaDonacion.dto';

@Injectable()
export class DonacionService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async crearDonacion(datos: NuevaDonacionDto){
        const { usuarioId, organizacionId, mascotaId, monto, comprobante} = datos
        const nuevaDonacion = this.prisma.donacion.create({
            data: {
                usuarioId,
                organizacionId,
                mascotaId,
                monto,
                comprobante
            }
    });
    }
}
