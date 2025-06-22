import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
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
}
