import { Controller, Get, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('upload')
export class UploadController{
    constructor(private readonly cloudinaryService: CloudinaryService){}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async subirArchivo(@UploadedFile() file: Express.Multer.File){
        const result = await this.cloudinaryService.subirIamgen(file);
        return { url:result.secure_url};
    }

    @Post('multiples')
    @UseInterceptors(FilesInterceptor('imagenes', 5))
    async subirMultiples(
        @UploadedFiles() files: Express.Multer.File[]
      ) {
        console.log('Retornando desde /multiples controller')
        return this.cloudinaryService.subirMultiplesImagenes(files);
      }

      @Get('prueba')
      getDePrueba(){
        return 'RETORNANDO DESDE CLOUDINARY CONTROLLER'
      }
}
