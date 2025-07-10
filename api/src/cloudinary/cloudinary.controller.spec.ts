import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

describe('UploadController', () => {
  let controller: UploadController;
  let service: CloudinaryService;

  const mockCloudinaryService = {
    subirIamgen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subirArchivo', () => {
    it('should upload file successfully and return secure URL', async () => {
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
        signature: 'test-signature',
        width: 800,
        height: 600,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2023-01-01T00:00:00Z',
        tags: [],
        bytes: 1024,
        type: 'upload',
        etag: 'test-etag',
        placeholder: false,
        url: 'http://res.cloudinary.com/test/image/upload/test-image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
        folder: 'hertsandpaws',
        original_filename: 'test-image',
        api_key: 'test-api-key',
      };

      mockCloudinaryService.subirIamgen.mockResolvedValue(mockUploadResult);

      // Act
      const result = await controller.subirArchivo(mockFile);

      // Assert
      expect(service.subirIamgen).toHaveBeenCalledWith(mockFile);
      expect(service.subirIamgen).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
      });
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
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

      const mockError = new Error('Cloudinary upload failed');
      mockCloudinaryService.subirIamgen.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.subirArchivo(mockFile)).rejects.toThrow('Cloudinary upload failed');
      expect(service.subirIamgen).toHaveBeenCalledWith(mockFile);
      expect(service.subirIamgen).toHaveBeenCalledTimes(1);
    });

    it('should handle different image formats', async () => {
      // Arrange
      const mockWebpFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 512,
        buffer: Buffer.from('fake-webp-data'),
        destination: '',
        filename: 'test-image.webp',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'test-webp-id',
        version: 1234567891,
        signature: 'test-signature-webp',
        width: 400,
        height: 300,
        format: 'webp',
        resource_type: 'image',
        created_at: '2023-01-01T00:00:00Z',
        tags: [],
        bytes: 512,
        type: 'upload',
        etag: 'test-etag-webp',
        placeholder: false,
        url: 'http://res.cloudinary.com/test/image/upload/test-image.webp',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.webp',
        folder: 'hertsandpaws',
        original_filename: 'test-image',
        api_key: 'test-api-key',
      };

      mockCloudinaryService.subirIamgen.mockResolvedValue(mockUploadResult);

      // Act
      const result = await controller.subirArchivo(mockWebpFile);

      // Assert
      expect(service.subirIamgen).toHaveBeenCalledWith(mockWebpFile);
      expect(result).toEqual({
        url: 'https://res.cloudinary.com/test/image/upload/test-image.webp',
      });
    });

    it('should handle large files', async () => {
      // Arrange
      const mockLargeFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'large-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 4 * 1024 * 1024, // 4MB
        buffer: Buffer.alloc(4 * 1024 * 1024, 'large-file-data'),
        destination: '',
        filename: 'large-image.jpg',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'large-image-id',
        version: 1234567892,
        signature: 'test-signature-large',
        width: 2000,
        height: 1500,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2023-01-01T00:00:00Z',
        tags: [],
        bytes: 4 * 1024 * 1024,
        type: 'upload',
        etag: 'test-etag-large',
        placeholder: false,
        url: 'http://res.cloudinary.com/test/image/upload/large-image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/large-image.jpg',
        folder: 'hertsandpaws',
        original_filename: 'large-image',
        api_key: 'test-api-key',
      };

      mockCloudinaryService.subirIamgen.mockResolvedValue(mockUploadResult);

      // Act
      const result = await controller.subirArchivo(mockLargeFile);

      // Assert
      expect(service.subirIamgen).toHaveBeenCalledWith(mockLargeFile);
      expect(result).toEqual({
        url: 'https://res.cloudinary.com/test/image/upload/large-image.jpg',
      });
    });

    it('should handle files with special characters in name', async () => {
      // Arrange
      const mockFileWithSpecialChars: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'imágen-especial_ñ.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('special-chars-data'),
        destination: '',
        filename: 'imágen-especial_ñ.jpg',
        path: '',
        stream: null as any,
      };

      const mockUploadResult: Partial<UploadApiResponse> = {
        public_id: 'special-chars-id',
        version: 1234567893,
        signature: 'test-signature-special',
        width: 600,
        height: 400,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2023-01-01T00:00:00Z',
        tags: [],
        bytes: 1024,
        type: 'upload',
        etag: 'test-etag-special',
        placeholder: false,
        url: 'http://res.cloudinary.com/test/image/upload/special-image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/special-image.jpg',
        folder: 'hertsandpaws',
        original_filename: 'imágen-especial_ñ',
        api_key: 'test-api-key',
      };

      mockCloudinaryService.subirIamgen.mockResolvedValue(mockUploadResult);

      // Act
      const result = await controller.subirArchivo(mockFileWithSpecialChars);

      // Assert
      expect(service.subirIamgen).toHaveBeenCalledWith(mockFileWithSpecialChars);
      expect(result).toEqual({
        url: 'https://res.cloudinary.com/test/image/upload/special-image.jpg',
      });
    });

    it('should handle undefined file gracefully', async () => {
      // Arrange
      const mockError = new Error('No file provided');
      mockCloudinaryService.subirIamgen.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.subirArchivo(undefined as any)).rejects.toThrow('No file provided');
      expect(service.subirIamgen).toHaveBeenCalledWith(undefined);
    });
  });
});
