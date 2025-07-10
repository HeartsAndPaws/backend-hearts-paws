import { Test, TestingModule } from '@nestjs/testing';
import { CasosController } from './casos.controller';
import { CasosService } from './casos.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCasoDto, TipoCaso } from './dto/create-caso.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('CasosController', () => {
  let controller: CasosController;
  let service: any;

  const mockCaso = {
    id: 'caso-1',
    titulo: 'Adopción de Firulais',
    descripcion: 'Perro muy amigable busca hogar',
    tipo: 'ADOPCION',
    mascotaId: 'mascota-1',
    ongId: 'ong-1',
    creado_en: new Date(),
    mascota: {
      id: 'mascota-1',
      nombre: 'Firulais',
      edad: 2,
      imagenes: []
    },
    ong: {
      id: 'ong-1',
      nombre: 'Refugio Esperanza'
    }
  };

  const mockCreateCasoDto: CreateCasoDto = {
    titulo: 'Adopción de Firulais',
    descripcion: 'Perro muy amigable busca hogar',
    tipo: TipoCaso.ADOPCION,
    mascotaId: 'mascota-1',
    adopcion: {
      estado: 'PENDIENTE'
    }
  };

  const mockAuthenticatedOngRequest = {
    user: {
      id: 'ong-1',
      email: 'ong@example.com',
      tipo: 'ONG'
    }
  };

  const mockAuthenticatedUserRequest = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      tipo: 'USUARIO'
    }
  };

  beforeEach(async () => {
    const mockCasosService = {
      GetCasos: jest.fn(),
      GetCasoById: jest.fn(),
      GetCasosAdopcion: jest.fn(),
      GetCasosDonacion: jest.fn(),
      obtenerIdDelCasoAdopcion: jest.fn(),
      CreateCaso: jest.fn(),
      buscarCasos: jest.fn(),
      obtenerCasosPorOng: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasosController],
      providers: [
        {
          provide: CasosService,
          useValue: mockCasosService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt-local'))
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CasosController>(CasosController);
    service = module.get(CasosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GetCasos', () => {
    it('should return all casos', async () => {
      const expectedCasos = [mockCaso];
      service.GetCasos.mockResolvedValue(expectedCasos);

      const result = await controller.GetCasos();

      expect(result).toEqual(expectedCasos);
      expect(service.GetCasos).toHaveBeenCalled();
    });
  });

  describe('GetCasosAdopcion', () => {
    it('should return adoption cases', async () => {
      const expectedCasos = [{ ...mockCaso, tipo: 'ADOPCION' }];
      service.GetCasosAdopcion.mockResolvedValue(expectedCasos);

      const result = await controller.GetCasosAdopcion();

      expect(result).toEqual(expectedCasos);
      expect(service.GetCasosAdopcion).toHaveBeenCalled();
    });
  });

  describe('GetCasosDonacion', () => {
    it('should return donation cases', async () => {
      const expectedCasos = [{ ...mockCaso, tipo: 'DONACION' }];
      service.GetCasosDonacion.mockResolvedValue(expectedCasos);

      const result = await controller.GetCasosDonacion();

      expect(result).toEqual(expectedCasos);
      expect(service.GetCasosDonacion).toHaveBeenCalled();
    });
  });

  describe('obtenerIdAdopcion', () => {
    it('should return adoption case ID', async () => {
      const expectedResult = { casoAdopcionId: 'adopcion-1' };
      service.obtenerIdDelCasoAdopcion.mockResolvedValue(expectedResult);

      const result = await controller.obtenerIdAdopcion('mascota-1');

      expect(result).toEqual(expectedResult);
      expect(service.obtenerIdDelCasoAdopcion).toHaveBeenCalledWith('mascota-1');
    });
  });

  describe('GetCasoById', () => {
    it('should return a caso by id', async () => {
      service.GetCasoById.mockResolvedValue(mockCaso);

      const result = await controller.GetCasoById('caso-1');

      expect(result).toEqual(mockCaso);
      expect(service.GetCasoById).toHaveBeenCalledWith('caso-1');
    });
  });

  describe('CreateCaso', () => {
    it('should create a new caso for authenticated organization', async () => {
      service.CreateCaso.mockResolvedValue(mockCaso);

      const result = await controller.CreateCaso(mockAuthenticatedOngRequest as any, mockCreateCasoDto);

      expect(result).toEqual(mockCaso);
      expect(service.CreateCaso).toHaveBeenCalledWith(mockCreateCasoDto, 'ong-1');
    });

    it('should throw UnauthorizedException if user is not an organization', async () => {
      try {
        await controller.CreateCaso(mockAuthenticatedUserRequest as any, mockCreateCasoDto);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Solo una organización puede crear casos.');
      }
    });
  });

  describe('buscarCasos', () => {
    it('should search cases with filters', async () => {
      const expectedCasos = [mockCaso];
      service.buscarCasos.mockResolvedValue(expectedCasos);

      const result = await controller.buscarCasos('Perro', 'Firulais');

      expect(result).toEqual(expectedCasos);
      expect(service.buscarCasos).toHaveBeenCalledWith({
        tipoMascota: 'Perro',
        nombreMascota: 'Firulais'
      });
    });

    it('should search cases with only tipoMascota filter', async () => {
      const expectedCasos = [mockCaso];
      service.buscarCasos.mockResolvedValue(expectedCasos);

      const result = await controller.buscarCasos('Perro', undefined);

      expect(result).toEqual(expectedCasos);
      expect(service.buscarCasos).toHaveBeenCalledWith({
        tipoMascota: 'Perro',
        nombreMascota: undefined
      });
    });

    it('should search cases with only nombreMascota filter', async () => {
      const expectedCasos = [mockCaso];
      service.buscarCasos.mockResolvedValue(expectedCasos);

      const result = await controller.buscarCasos(undefined, 'Firulais');

      expect(result).toEqual(expectedCasos);
      expect(service.buscarCasos).toHaveBeenCalledWith({
        tipoMascota: undefined,
        nombreMascota: 'Firulais'
      });
    });
  });

  describe('obtenerCasosPorOng', () => {
    it('should return cases for authenticated organization', async () => {
      const expectedCasos = [mockCaso];
      service.obtenerCasosPorOng.mockResolvedValue(expectedCasos);

      const result = await controller.obtenerCasosPorOng(mockAuthenticatedOngRequest as any);

      expect(result).toEqual(expectedCasos);
      expect(service.obtenerCasosPorOng).toHaveBeenCalledWith('ong-1');
    });

    it('should throw UnauthorizedException if user is not an organization', async () => {
      await expect(controller.obtenerCasosPorOng(mockAuthenticatedUserRequest as any))
        .rejects.toThrow(new UnauthorizedException('Solo una organizacion puede acceder a esta ruta.'));
    });
  });
});
