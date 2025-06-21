import { Body, Controller, Post } from '@nestjs/common';
import { ServicioDyA } from './dya.service';
import { CrearCasoDto } from './dtos/crear-caso.dto';

@Controller('dya')
export class CasosController {
  constructor(private readonly servicioDyA: ServicioDyA) {}

  @Post()
  crearCaso(@Body() dto: CrearCasoDto) {
    return this.servicioDyA.crearCaso(dto);
  }
}
