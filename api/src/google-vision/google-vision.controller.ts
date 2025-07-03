import { Controller, Post, Body } from '@nestjs/common';
import { GoogleVisionService } from './google-vision.service';

@Controller('vision')
export class GoogleVisionController {
  constructor(private readonly googleVisionService: GoogleVisionService) {}

  @Post('analyze')
  async analizar(@Body() body: { imageUrl: string }) {
    return this.googleVisionService.analizarImagen(body.imageUrl);
  }
}
