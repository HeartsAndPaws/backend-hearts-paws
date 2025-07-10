import { Test, TestingModule } from '@nestjs/testing';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { AuthenticateRequest } from '../common/interfaces/authenticated-request.interface';

describe('DonacionController', () => {
  let controller: DonacionController;
  let service: any;

  const mockDonacion = {
    id: 'donacion-1',
    monto: 1000,
    fecha: new Date('2025-01-01T10:00:00Z'),
    usuarioId: 'usuario-1',
    organizacionId: 'ong-1',
    mascotaId: 'mascota-1',
    casoDonacionId: 'caso-donacion-1',
    usuario: {
      id: 'usuario-1',
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    },
    organizacion: {
      id: 'ong-1',
      nombre: 'ONG Rescate',
      email: 'ong@example.com'
    },
    mascota: {
      id: 'mascota-1',
      nombre: 'Firulais'
    },
    casoDonacion: {
      id: 'caso-donacion-1',
      caso: {
        titulo: 'Ayuda para Firulais'
      }
    },
    montoFormateado: '$1000.00'
  };

  const mockAuthenticatedAdminRequest = {
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      tipo: 'ADMIN'
    }
  };

  const mockAuthenticatedOngRequest = {
    user: {
      id: 'ong-1',
      email: 'ong@example.com',
      tipo: 'ONG'
    }
  };

  beforeEach(async () => {
    const mockDonacionService = {
      getDonaciones: jest.fn(),
      obtenerValorTotalDonaciones: jest.fn(),
      getDonacionesByOngId: jest.fn(),
      getDonacionById: jest.fn(),
      getDetalleDonacionByCasoId: jest.fn(),
      getDetallesDonacion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonacionController],
      providers: [
        {
          provide: DonacionService,
          useValue: mockDonacionService,
        },
      ],
    })
      .overrideGuard(AuthGuard(['jwt-local', 'supabase']))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AuthGuard('jwt-local'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DonacionController>(DonacionController);
    service = module.get(DonacionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDonaciones', () => {
    it('should return all donations with filters', async () => {
      const expectedDonaciones = [mockDonacion];
      service.getDonaciones.mockResolvedValue(expectedDonaciones);

      const result = await controller.getAllDonaciones(
        'Juan',
        'juan@example.com',
        'ONG',
        'ong@example.com',
        '2025-01-01'
      );

      expect(result).toEqual(expectedDonaciones);
      expect(service.getDonaciones).toHaveBeenCalledWith({
        nombreUsuario: 'Juan',
        emailUsuario: 'juan@example.com',
        nombreOng: 'ONG',
        emailOng: 'ong@example.com',
        fecha: '2025-01-01',
      });
    });

    it('should return all donations without filters', async () => {
      const expectedDonaciones = [mockDonacion];
      service.getDonaciones.mockResolvedValue(expectedDonaciones);

      const result = await controller.getAllDonaciones();

      expect(result).toEqual(expectedDonaciones);
      expect(service.getDonaciones).toHaveBeenCalledWith({
        nombreUsuario: undefined,
        emailUsuario: undefined,
        nombreOng: undefined,
        emailOng: undefined,
        fecha: undefined,
      });
    });

    it('should return empty array when no donations found', async () => {
      service.getDonaciones.mockResolvedValue([]);

      const result = await controller.getAllDonaciones();

      expect(result).toEqual([]);
    });
  });

  describe('obtenerTotalDonado', () => {
    it('should return total donated amount', async () => {
      const expectedTotal = { total: 15000, totalFormatado: '$15000.00' };
      service.obtenerValorTotalDonaciones.mockResolvedValue(expectedTotal);

      const result = await controller.obtenerTotalDonado();

      expect(result).toEqual(expectedTotal);
      expect(service.obtenerValorTotalDonaciones).toHaveBeenCalled();
    });

    it('should return zero when no donations exist', async () => {
      const expectedTotal = { total: 0, totalFormatado: '$0.00' };
      service.obtenerValorTotalDonaciones.mockResolvedValue(expectedTotal);

      const result = await controller.obtenerTotalDonado();

      expect(result).toEqual(expectedTotal);
    });
  });

  describe('getDonacionesByOngId', () => {
    it('should return donations for authenticated ONG', async () => {
      const expectedDonaciones = [mockDonacion];
      service.getDonacionesByOngId.mockResolvedValue(expectedDonaciones);

      const result = await controller.getDonacionesByOngId(mockAuthenticatedOngRequest as AuthenticateRequest);

      expect(result).toEqual(expectedDonaciones);
      expect(service.getDonacionesByOngId).toHaveBeenCalledWith('ong-1');
    });

    it('should return empty array when no donations found for ONG', async () => {
      service.getDonacionesByOngId.mockResolvedValue([]);

      const result = await controller.getDonacionesByOngId(mockAuthenticatedOngRequest as AuthenticateRequest);

      expect(result).toEqual([]);
    });
  });

  describe('getDonacionById', () => {
    it('should return a donation by id', async () => {
      const expectedDonacion = { ...mockDonacion, montoformateado: '$1000.00' };
      service.getDonacionById.mockResolvedValue(expectedDonacion);

      const result = await controller.getDonacionById('donacion-1');

      expect(result).toEqual(expectedDonacion);
      expect(service.getDonacionById).toHaveBeenCalledWith('donacion-1');
    });

    it('should handle non-existent donation', async () => {
      const expectedResult = { montoformateado: null };
      service.getDonacionById.mockResolvedValue(expectedResult);

      const result = await controller.getDonacionById('donacion-nonexistent');

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDetalleDonacionByCasoId', () => {
    it('should return donation details for a case', async () => {
      const expectedDetalles = [
        {
          id: 'caso-donacion-1',
          casoId: 'caso-1',
          metaDonacion: 5000,
          estadoDonacion: 2000,
          estadoDonacionARS: '$2000.00',
          metaDonacionARS: '$5000.00',
          progreso: '40.00'
        }
      ];
      service.getDetalleDonacionByCasoId.mockResolvedValue(expectedDetalles);

      const result = await controller.getDetalleDonacionByCasoId('caso-1');

      expect(result).toEqual(expectedDetalles);
      expect(service.getDetalleDonacionByCasoId).toHaveBeenCalledWith('caso-1');
    });

    it('should handle forbidden access', async () => {
      service.getDetalleDonacionByCasoId.mockRejectedValue(new Error('Forbidden'));

      await expect(controller.getDetalleDonacionByCasoId('caso-forbidden'))
        .rejects.toThrow('Forbidden');
    });
  });

  describe('getDetallesDonacion', () => {
    it('should return all donation details', async () => {
      const expectedDetalles = [
        {
          id: 'caso-donacion-1',
          casoId: 'caso-1',
          metaDonacion: 5000,
          estadoDonacion: 2000,
          estadoDonacionARS: '$2000.00',
          metaDonacionARS: '$5000.00',
          progreso: '40.00'
        }
      ];
      service.getDetallesDonacion.mockResolvedValue(expectedDetalles);

      const result = await controller.getDetallesDonacion();

      expect(result).toEqual(expectedDetalles);
      expect(service.getDetallesDonacion).toHaveBeenCalled();
    });

    it('should return empty array when no details found', async () => {
      service.getDetallesDonacion.mockResolvedValue([]);

      const result = await controller.getDetallesDonacion();

      expect(result).toEqual([]);
    });
  });
});
