import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizacioneDto } from './create-organizacione.dto';

export class UpdateOrganizacioneDto extends PartialType(CreateOrganizacioneDto) {}
