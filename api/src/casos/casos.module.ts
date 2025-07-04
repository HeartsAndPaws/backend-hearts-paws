import { Module } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CasosController } from './casos.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleVisionModule } from 'src/google-vision/google-vision.module';

@Module({
  imports: [GoogleVisionModule],
  controllers: [CasosController],
  providers: [CasosService, PrismaService],
})
export class CasosModule {}
