import { Test, TestingModule } from '@nestjs/testing';
import { DonacionService } from './donacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

// Mock para las funciones de formateo
jest.mock('src/utils/formatters', () => ({
  formatearARS: jest.fn((amount) => `$${amount.toFixed(2)}`),
  calcularPorcentajeProgreso: jest.fn((meta, actual) => ((actual / meta) * 100).toFixed(2))
}));

describe('DonacionService', () => {
  let service: DonacionService;
  let prismaService: any;

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
    }
  };

  const mockCasoDonacion = {
    id: 'caso-donacion-1',
    casoId: 'caso-1',
    metaDonacion: 5000,
    estadoDonacion: 2000
  };

  beforeEach(async () => {
    const mockPrismaService = {
      donacion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        aggregate: jest.fn()
      },
      casoDonacion: {
        findMany: jest.fn()
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonacionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DonacionService>(DonacionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDonaciones', () => {
    it('should return donations with filters', async () => {
      const expectedDonaciones = [mockDonacion];
      prismaService.donacion.findMany.mockResolvedValue(expectedDonaciones);

      const filtros = {
        nombreUsuario: 'Juan',
        emailUsuario: 'juan@example.com',
        nombreOng: 'ONG',
        emailOng: 'ong@example.com',
        fecha: '2025-01-01'
      };

      const result = await service.getDonaciones(filtros);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('montoFormateado');
      expect(prismaService.donacion.findMany).toHaveBeenCalledWith({
        where: {
          fecha: {
            gte: new Date('2025-01-01T00:00:00Z'),
            lte: new Date('2025-01-01T23:59:59Z'),
          },
          usuario: {
            nombre: { contains: 'Juan', mode: 'insensitive' },
            email: { contains: 'juan@example.com', mode: 'insensitive' }
          },
          organizacion: {
            nombre: { contains: 'ONG', mode: 'insensitive' },
            email: { contains: 'ong@example.com', mode: 'insensitive' }
          }
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          organizacion: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          mascota: {
            select: {
              id: true,
              nombre: true,
            },
          },
          casoDonacion: {
            select: {
              id: true,
              caso: {
                select: {
                  titulo: true,
                },
              },
            },
          },
        },
        orderBy: {
          fecha: 'desc',
        },
      });
    });

    it('should return donations without filters', async () => {
      const expectedDonaciones = [mockDonacion];
      prismaService.donacion.findMany.mockResolvedValue(expectedDonaciones);

      const result = await service.getDonaciones({});

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('montoFormateado');
      expect(prismaService.donacion.findMany).toHaveBeenCalledWith({
        where: {
          usuario: {},
          organizacion: {}
        },
        include: expect.any(Object),
        orderBy: {
          fecha: 'desc',
        },
      });
    });

    it('should return empty array when no donations found', async () => {
      prismaService.donacion.findMany.mockResolvedValue([]);

      const result = await service.getDonaciones({});

      expect(result).toEqual([]);
    });
  });

  describe('getDonacionesByOngId', () => {
    it('should return donations for specific ONG', async () => {
      const expectedDonaciones = [mockDonacion];
      prismaService.donacion.findMany.mockResolvedValue(expectedDonaciones);

      const result = await service.getDonacionesByOngId('ong-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('montoformateado');
      expect(prismaService.donacion.findMany).toHaveBeenCalledWith({
        where: {
          organizacionId: 'ong-1'
        },
        include: {
          usuario: true,
          organizacion: true,
          mascota: true,
          casoDonacion: true,
        },
      });
    });

    it('should return empty array when no donations found for ONG', async () => {
      prismaService.donacion.findMany.mockResolvedValue([]);

      const result = await service.getDonacionesByOngId('ong-nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getDonacionById', () => {
    it('should return a donation by id', async () => {
      prismaService.donacion.findUnique.mockResolvedValue(mockDonacion);

      const result = await service.getDonacionById('donacion-1');

      expect(result).toHaveProperty('montoformateado');
      expect(prismaService.donacion.findUnique).toHaveBeenCalledWith({
        where: { id: 'donacion-1' },
        include: {
          usuario: true,
          organizacion: true,
          mascota: true,
          casoDonacion: true,
        },
      });
    });

    it('should return null montoformateado when donation not found', async () => {
      prismaService.donacion.findUnique.mockResolvedValue(null);

      const result = await service.getDonacionById('donacion-nonexistent');

      expect(result.montoformateado).toBeNull();
    });
  });

  describe('obtenerValorTotalDonaciones', () => {
    it('should return total donated amount', async () => {
      const mockAggregate = {
        _sum: {
          monto: 15000
        }
      };
      prismaService.donacion.aggregate.mockResolvedValue(mockAggregate);

      const result = await service.obtenerValorTotalDonaciones();

      expect(result).toHaveProperty('total', 15000);
      expect(result).toHaveProperty('totalFormatado');
      expect(prismaService.donacion.aggregate).toHaveBeenCalledWith({
        _sum: {
          monto: true,
        },
      });
    });

    it('should return 0 when no donations exist', async () => {
      const mockAggregate = {
        _sum: {
          monto: null
        }
      };
      prismaService.donacion.aggregate.mockResolvedValue(mockAggregate);

      const result = await service.obtenerValorTotalDonaciones();

      expect(result).toHaveProperty('total', 0);
      expect(result).toHaveProperty('totalFormatado');
    });
  });

  describe('getDetalleDonacionByCasoId', () => {
    it('should return donation details for a case', async () => {
      const mockCasos = [mockCasoDonacion];
      prismaService.donacion.findFirst.mockResolvedValue(mockDonacion);
      prismaService.casoDonacion.findMany.mockResolvedValue(mockCasos);

      const result = await service.getDetalleDonacionByCasoId('caso-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('estadoDonacionARS');
      expect(result[0]).toHaveProperty('metaDonacionARS');
      expect(result[0]).toHaveProperty('progreso');
      expect(prismaService.donacion.findFirst).toHaveBeenCalledWith({
        where: {
          casoDonacion: {
            casoId: 'caso-1',
          },
        },
      });
      expect(prismaService.casoDonacion.findMany).toHaveBeenCalledWith({
        where: { casoId: 'caso-1' },
      });
    });

    it('should throw ForbiddenException when no donations found for case', async () => {
      prismaService.donacion.findFirst.mockResolvedValue(null);

      await expect(service.getDetalleDonacionByCasoId('caso-nonexistent'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDetallesDonacion', () => {
    it('should return all donation details', async () => {
      const mockCasos = [mockCasoDonacion];
      prismaService.casoDonacion.findMany.mockResolvedValue(mockCasos);

      const result = await service.getDetallesDonacion();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('estadoDonacionARS');
      expect(result[0]).toHaveProperty('metaDonacionARS');
      expect(result[0]).toHaveProperty('progreso');
      expect(prismaService.casoDonacion.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no donation cases found', async () => {
      prismaService.casoDonacion.findMany.mockResolvedValue([]);

      const result = await service.getDetallesDonacion();

      expect(result).toEqual([]);
    });
  });
});
