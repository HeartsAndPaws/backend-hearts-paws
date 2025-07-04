import { Get, Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: typeof Cloudinary,
    private readonly prisma: PrismaService
  ){}

  async subirIamgen(file: Express.Multer.File): Promise<UploadApiResponse>{
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream({ folder: 'hertsandpaws'}, (error, result) => {
        if (error || !result) return reject(error || new Error('Subida de archivos fallida'))
          resolve(result);
      }).end(file.buffer);
    })
  }
  
  async subirMultiplesImagenes(files: Express.Multer.File[]): Promise<string[]> {
  const resultados = await Promise.all(
    files.map(file => this.subirIamgen(file))
  );
  return resultados.map(res => res.secure_url);
}


  async subirPdf(file: Express.Multer.File): Promise<UploadApiResponse>{
    return new Promise((resolve, rejects) => {
      this.cloudinary.uploader.upload_stream({
        folder: 'heartsandpaws/verificaciones',
        resource_type: 'raw',
        public_id: file.originalname.replace(/\.pdf$/, ''),
        use_filename: true,
        unique_filename: false,
      },
    (error, result) => {
      if (error || !result) {
        return rejects(error || new Error('subida del PDF fallida'))
      }
      resolve(result);
    },
    ).end(file.buffer);
    })
  }

}



