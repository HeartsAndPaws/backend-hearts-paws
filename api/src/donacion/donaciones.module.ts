import { Module } from '@nestjs/common';
import { DonacionesController } from './donaciones.controller';
import { DonacionService } from './donaciones.service';

@Module({
  controllers: [DonacionesController],
  providers: [DonacionService]
})
export class DonacionModule {}
