import { Module } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudAdoptarController } from './solicitud-adoptar.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SolicitudAdoptarController],
  providers: [SolicitudAdoptarService, PrismaService],
})
export class SolicitudAdoptarModule {}
