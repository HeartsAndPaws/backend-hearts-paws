import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';


@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary){}

  async subirIamgen(file: Express.Multer.File): Promise<UploadApiResponse>{
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream({ folder: 'hertsandpaws'}, (error, result) => {
        if (error || !result) return reject(error || new Error('Subida de archivos fallida'))
          resolve(result);
      }).end(file.buffer);
    })
  }
}



