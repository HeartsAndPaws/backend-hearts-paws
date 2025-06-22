import { UnsupportedMediaTypeException } from "@nestjs/common";

export const filtroArchivoImagen = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) => {
    const tiposMimePermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!tiposMimePermitidos.includes(file.mimetype)) {
        return callback(
            new UnsupportedMediaTypeException('Formato de imagen no soportado'),
            false,
        );
    }
    callback(null, true);
};

export const limits = {
    fileSize: 2 * 1024 * 1024, // 2 MB 
}