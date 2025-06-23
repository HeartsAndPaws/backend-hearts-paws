import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudAdoptarDto } from './solicitud-adoptar.dto';

export class UpdateSolicitudAdoptarDto extends PartialType(CreateSolicitudAdoptarDto) {}
