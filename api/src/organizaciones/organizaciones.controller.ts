import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacioneDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacioneDto } from './dto/update-organizacione.dto';

@Controller('organizaciones')
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
  create(@Body() createOrganizacioneDto: CreateOrganizacioneDto) {
    return this.organizacionesService.create(createOrganizacioneDto);
  }

  @Get()
  findAll() {
    return this.organizacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizacioneDto: UpdateOrganizacioneDto) {
    return this.organizacionesService.update(+id, updateOrganizacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizacionesService.remove(+id);
  }
}
