import { Module } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { OrganizacionesController } from './organizaciones.controller';

@Module({
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
})
export class OrganizacionesModule {}
