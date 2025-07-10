import { Test, TestingModule } from '@nestjs/testing';
import { OrganizacionesService } from '../organizaciones.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/shared/email/email-server.service';
import { EstadoOrganizacion } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('OrganizacionesService', () => {
  let service: OrganizacionesService;
  let prisma: PrismaService;
  let mailerService: MailerService;

  const mockPrisma = {
    organizacion: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockMailerService = {
    enviarEstadoActualizado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizacionesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<OrganizacionesService>(OrganizacionesService);
    prisma = module.get<PrismaService>(PrismaService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('actualizarFotoPerfil', () => {
    it('debería actualizar la foto de perfil', async () => {
      const resultMock = {
        id: '1',
        nombre: 'Refugio',
        email: 'test@test.com',
        imagenPerfil: 'url.com',
        plan: 'GRATIS',
        creado_en: new Date(),
      };

      mockPrisma.organizacion.update.mockResolvedValue(resultMock);

      const result = await service.actualizarFotoPerfil('1', 'url.com');

      expect(mockPrisma.organizacion.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { imagenPerfil: 'url.com' },
        select: expect.any(Object),
      });
      expect(result).toEqual(resultMock);
    });
  });

  describe('buscarPorId', () => {
    it('debería devolver una organización existente', async () => {
      const organizacionMock = { id: '1', nombre: 'Refugio' };
      mockPrisma.organizacion.findUnique.mockResolvedValue(organizacionMock);

      const result = await service.buscarPorId('1');
      expect(result).toEqual(organizacionMock);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockPrisma.organizacion.findUnique.mockResolvedValue(null);
      await expect(service.buscarPorId('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarDatosOng', () => {
    it('debería actualizar los datos si existe', async () => {
      const datos = { nombre: 'Nuevo Refugio' };
      const id = '1';

      mockPrisma.organizacion.findUnique.mockResolvedValue({ id });
      mockPrisma.organizacion.update.mockResolvedValue({
        ...datos,
        id,
        creado_en: new Date(),
      });

      const result = await service.actualizarDatosOng(id, datos as any);
      expect(result.nombre).toEqual(datos.nombre);
    });

    it('debería lanzar error si no existe la organización', async () => {
      mockPrisma.organizacion.findUnique.mockResolvedValue(null);
      await expect(
        service.actualizarDatosOng('123', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarEstado', () => {
    it('debería actualizar el estado y enviar email', async () => {
      const org = { id: '1', email: 'test@test.com' };

      mockPrisma.organizacion.findUnique.mockResolvedValue(org);
      mockPrisma.organizacion.update.mockResolvedValue({
        ...org,
        estado: EstadoOrganizacion.APROBADA,
      });

      const result = await service.actualizarEstado('1', EstadoOrganizacion.APROBADA);

      expect(mockPrisma.organizacion.update).toHaveBeenCalled();
      expect(mailerService.enviarEstadoActualizado).toHaveBeenCalledWith(
        'test@test.com',
        'ACEPTADA',
      );
      expect(result.ok).toBe(true);
    });

    it('debería lanzar NotFoundException si no encuentra la organización', async () => {
      mockPrisma.organizacion.findUnique.mockResolvedValue(null);
      await expect(
        service.actualizarEstado('fake-id', EstadoOrganizacion.RECHAZADA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarTodas', () => {
    it('debería devolver todas las organizaciones pendientes', async () => {
      mockPrisma.organizacion.findMany.mockResolvedValue([
        { id: '1', nombre: 'Refugio' },
      ]);

      const result = await service.listarTodas({});
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('contarAprobadas', () => {
    it('debería devolver el total de aprobadas', async () => {
      mockPrisma.organizacion.count.mockResolvedValue(5);

      const result = await service.contarAprobadas();
      expect(result).toEqual({ total: 5 });
    });
  });

  describe('buscarPorEmail', () => {
    it('debería devolver una organización por email', async () => {
      const mockOrg = { id: '1', email: 'ong@email.com' };
      mockPrisma.organizacion.findUnique.mockResolvedValue(mockOrg);

      const result = await service.buscarPorEmail('ong@email.com');
      expect(result).toEqual(mockOrg);
    });
  });
});