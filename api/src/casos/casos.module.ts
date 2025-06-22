import { Module } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CasosController } from './casos.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CasosController],
  providers: [CasosService, PrismaService],
})
export class CasosModule {}
