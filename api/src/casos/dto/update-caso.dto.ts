import { PartialType } from '@nestjs/mapped-types';
import { CreateCasoDto } from './create-caso.dto';

export class UpdateCasoDto extends PartialType(CreateCasoDto) {}
