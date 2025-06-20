import { Controller, Injectable, Post } from '@nestjs/common';
import { NuevaDonacionDto } from './dtos/nuevaDonacion.dto';
import { DonacionService } from './donaciones.service';

@Controller('donacion')
@Injectable()
export class DonacionesController {
    constructor(
        private readonly servicioDonacion: DonacionService
    ) {}
    @Post()
    async donar(datos: NuevaDonacionDto){
        return this.servicioDonacion.donar(datos)
    }
}
