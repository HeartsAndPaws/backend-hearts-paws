import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearCasoDto, TipoCaso } from './dtos/crear-caso.dto';

@Injectable()
export class ServicioDyA {
  constructor(private prisma: PrismaService) {}

async crearCaso(datosDelCaso: CrearCasoDto) {
  const { tipo, metaDonacion, idMascota, idOng, ...resto } = datosDelCaso;

  const data: any = {
    ...resto,
    tipo,
    mascota: { connect: { id: idMascota } },
    ong: { connect: { id: idOng } },
  };

  if (tipo === 'DONACION') {
    data.donacion = {
      create: {
        estadoDonacion: 0,
        metaDonacion,
      },
    };
  } else if (tipo === 'ADOPCION') {
    data.adopcion = {
      create: {
        estado: 'PENDIENTE',
      },
    };
  }

  return await this.prisma.caso.create({ data });
}}
