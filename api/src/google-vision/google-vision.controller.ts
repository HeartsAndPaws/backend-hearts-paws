import { Controller, Post, Body, Get } from '@nestjs/common';
import { GoogleVisionService } from './google-vision.service';

@Controller('vision')
export class GoogleVisionController {
  constructor(
    private readonly googleVisionService: GoogleVisionService
  ) {}

  @Post('analyze')
  async analizar(@Body() body: { imageUrl: string }) {
    return this.googleVisionService.analizarImagen(body.imageUrl);
  }

        @Get('imagenes')
      async verImagenes(){
        return this.googleVisionService.getImagenesSensibles()
      }

}
