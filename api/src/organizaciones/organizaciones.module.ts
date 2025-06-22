import { Module } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { OrganizacionesController } from './organizaciones.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
})
export class OrganizacionesModule {}
