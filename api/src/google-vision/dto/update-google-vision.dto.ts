import { PartialType } from '@nestjs/mapped-types';
import { CreateGoogleVisionDto } from './create-google-vision.dto';

export class UpdateGoogleVisionDto extends PartialType(CreateGoogleVisionDto) {}
