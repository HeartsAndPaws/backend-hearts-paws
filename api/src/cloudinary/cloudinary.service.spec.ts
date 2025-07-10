import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Mock de Cloudinary
const mockCloudinary = {
  uploader: {
    upload_stream: jest.fn(),
  },
};

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: 'CLOUDINARY',
          useValue: mockCloudinary,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subirIamgen', () => {
    it('should upload image successfully', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: 'test-image.jpg',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'test-public-id',
        version: 1234567890,
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
        url: 'http://res.cloudinary.com/test/image/upload/test-image.jpg',
        folder: 'hertsandpaws',
        format: 'jpg',
        resource_type: 'image',
        bytes: 1024,
      };

      // Mock del stream que se retorna
      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback con éxito
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        // Simular que el callback se ejecuta con éxito
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      // Act
      const result = await service.subirIamgen(mockFile);

      // Assert
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'hertsandpaws' },
        expect.any(Function)
      );
      expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle upload error', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'error-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-error-data'),
        destination: '',
        filename: 'error-image.jpg',
        path: '',
        stream: null as any,
      };

      const mockError = new Error('Cloudinary upload failed');
      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback con error
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(mockError, null), 0);
        return mockStream;
      });

      // Act & Assert
      await expect(service.subirIamgen(mockFile)).rejects.toThrow('Cloudinary upload failed');
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'hertsandpaws' },
        expect.any(Function)
      );
      expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should handle upload with no result', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'no-result.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('no-result-data'),
        destination: '',
        filename: 'no-result.jpg',
        path: '',
        stream: null as any,
      };

      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback sin error pero sin result
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, null), 0);
        return mockStream;
      });

      // Act & Assert
      await expect(service.subirIamgen(mockFile)).rejects.toThrow('Subida de archivos fallida');
      expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should upload different image formats', async () => {
      // Arrange
      const mockPngFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('fake-png-data'),
        destination: '',
        filename: 'test-image.png',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'test-png-id',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.png',
        format: 'png',
        folder: 'hertsandpaws',
      };

      const mockStream = {
        end: jest.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      // Act
      const result = await service.subirIamgen(mockPngFile);

      // Assert
      expect(result).toEqual(mockUploadResult);
      expect(mockStream.end).toHaveBeenCalledWith(mockPngFile.buffer);
    });
  });

  describe('subirPdf', () => {
    it('should upload PDF successfully', async () => {
      // Arrange
      const mockPdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 5120,
        buffer: Buffer.from('fake-pdf-data'),
        destination: '',
        filename: 'document.pdf',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'document',
        version: 1234567890,
        secure_url: 'https://res.cloudinary.com/test/raw/upload/document.pdf',
        url: 'http://res.cloudinary.com/test/raw/upload/document.pdf',
        folder: 'heartsandpaws/verificaciones',
        format: 'pdf',
        resource_type: 'raw',
        bytes: 5120,
      };

      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback con éxito
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      // Act
      const result = await service.subirPdf(mockPdfFile);

      // Assert
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'heartsandpaws/verificaciones',
          resource_type: 'raw',
          public_id: 'document',
          use_filename: true,
          unique_filename: false,
        },
        expect.any(Function)
      );
      expect(mockStream.end).toHaveBeenCalledWith(mockPdfFile.buffer);
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle PDF upload error', async () => {
      // Arrange
      const mockPdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'error-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake-error-pdf'),
        destination: '',
        filename: 'error-document.pdf',
        path: '',
        stream: null as any,
      };

      const mockError = new Error('PDF upload failed');
      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback con error
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(mockError, null), 0);
        return mockStream;
      });

      // Act & Assert
      await expect(service.subirPdf(mockPdfFile)).rejects.toThrow('PDF upload failed');
      expect(mockStream.end).toHaveBeenCalledWith(mockPdfFile.buffer);
    });

    it('should handle PDF upload with no result', async () => {
      // Arrange
      const mockPdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'no-result.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('no-result-pdf'),
        destination: '',
        filename: 'no-result.pdf',
        path: '',
        stream: null as any,
      };

      const mockStream = {
        end: jest.fn(),
      };

      // Configurar mock para que llame al callback sin error pero sin result
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, null), 0);
        return mockStream;
      });

      // Act & Assert
      await expect(service.subirPdf(mockPdfFile)).rejects.toThrow('subida del PDF fallida');
      expect(mockStream.end).toHaveBeenCalledWith(mockPdfFile.buffer);
    });

    it('should process PDF filename correctly', async () => {
      // Arrange
      const mockPdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'verification-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 3072,
        buffer: Buffer.from('verification-pdf-data'),
        destination: '',
        filename: 'verification-document.pdf',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'verification-document',
        secure_url: 'https://res.cloudinary.com/test/raw/upload/verification-document.pdf',
        folder: 'heartsandpaws/verificaciones',
        resource_type: 'raw',
      };

      const mockStream = {
        end: jest.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      // Act
      const result = await service.subirPdf(mockPdfFile);

      // Assert
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'heartsandpaws/verificaciones',
          resource_type: 'raw',
          public_id: 'verification-document', // Sin la extensión .pdf
          use_filename: true,
          unique_filename: false,
        },
        expect.any(Function)
      );
      expect(result).toEqual(mockUploadResult);
    });

    it('should handle PDF with special characters in filename', async () => {
      // Arrange
      const mockPdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'documento-especial_ñ.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('special-pdf-data'),
        destination: '',
        filename: 'documento-especial_ñ.pdf',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'documento-especial_ñ',
        secure_url: 'https://res.cloudinary.com/test/raw/upload/documento-especial.pdf',
        folder: 'heartsandpaws/verificaciones',
        resource_type: 'raw',
      };

      const mockStream = {
        end: jest.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      // Act
      const result = await service.subirPdf(mockPdfFile);

      // Assert
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'heartsandpaws/verificaciones',
          resource_type: 'raw',
          public_id: 'documento-especial_ñ',
          use_filename: true,
          unique_filename: false,
        },
        expect.any(Function)
      );
      expect(result).toEqual(mockUploadResult);
    });
  });
});
