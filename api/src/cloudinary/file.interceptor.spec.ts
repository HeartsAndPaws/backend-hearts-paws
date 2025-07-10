import { UnsupportedMediaTypeException } from '@nestjs/common';
import { filtroArchivoImagen, limits } from './file.interceptor';

describe('File Interceptor', () => {
  describe('filtroArchivoImagen', () => {
    let mockRequest: Express.Request;
    let mockCallback: jest.Mock;

    beforeEach(() => {
      mockRequest = {} as Express.Request;
      mockCallback = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should accept JPEG images', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-jpeg-data'),
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null, true);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should accept PNG images', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from('fake-png-data'),
        destination: '',
        filename: 'test.png',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should accept WebP images', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 1024,
        buffer: Buffer.from('fake-webp-data'),
        destination: '',
        filename: 'test.webp',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should accept JPG images', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpg',
        size: 1024,
        buffer: Buffer.from('fake-jpg-data'),
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should reject PDF files', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake-pdf-data'),
        destination: '',
        filename: 'document.pdf',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should reject text files', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'document.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('fake-text-data'),
        destination: '',
        filename: 'document.txt',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should reject video files', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'video.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('fake-video-data'),
        destination: '',
        filename: 'video.mp4',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should reject audio files', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 1024,
        buffer: Buffer.from('fake-audio-data'),
        destination: '',
        filename: 'audio.mp3',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should reject GIF images (not in allowed list)', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'animation.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 1024,
        buffer: Buffer.from('fake-gif-data'),
        destination: '',
        filename: 'animation.gif',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should reject SVG images (not in allowed list)', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'icon.svg',
        encoding: '7bit',
        mimetype: 'image/svg+xml',
        size: 1024,
        buffer: Buffer.from('fake-svg-data'),
        destination: '',
        filename: 'icon.svg',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should handle undefined mimetype', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'unknown-file',
        encoding: '7bit',
        mimetype: undefined as any,
        size: 1024,
        buffer: Buffer.from('unknown-data'),
        destination: '',
        filename: 'unknown-file',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });

    it('should handle empty mimetype', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'empty-mimetype',
        encoding: '7bit',
        mimetype: '',
        size: 1024,
        buffer: Buffer.from('empty-mimetype-data'),
        destination: '',
        filename: 'empty-mimetype',
        path: '',
        stream: null as any,
      };

      // Act
      filtroArchivoImagen(mockRequest, mockFile, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        new UnsupportedMediaTypeException('Formato de imagen no soportado'),
        false
      );
    });
  });

  describe('limits', () => {
    it('should have correct file size limit', () => {
      // Assert
      expect(limits.fileSize).toBe(5 * 1024 * 1024); // 5 MB
    });

    it('should have file size limit in bytes', () => {
      // Assert
      expect(limits.fileSize).toBe(5242880); // 5 MB en bytes
    });
  });
});
