import { Injectable } from '@nestjs/common';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';

@Injectable()
export class OrganizacionesService {
  create(createOrganizacioneDto: CreateOrganizacioneDto) {
    return 'This action adds a new organizacione';
  }

  findAll() {
    return `This action returns all organizaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organizacione`;
  }

  update(id: number, updateOrganizacioneDto: UpdateOrganizacioneDto) {
    return `This action updates a #${id} organizacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizacione`;
  }
}
