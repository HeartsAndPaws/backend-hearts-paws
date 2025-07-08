import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/shared/email/email-server.service';
import { BadRequestException } from '@nestjs/common';
import { EstadoAdopcion } from '@prisma/client';
import { prismaMock } from 'test/mocks/prisma.mock';

describe('SolicitudAdoptarService', () => {
  let service: SolicitudAdoptarService;

  const mockMailerService = {
    enviarEmailsNotificacionAdopcion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudAdoptarService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<SolicitudAdoptarService>(SolicitudAdoptarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearSolicitud', () => {
    const mockUsuarioId = 'usuario-id-123';
    const mockDto = {
      casoAdopcionId: 'caso-id-123',
      estado: EstadoAdopcion.PENDIENTE,
      tipoVivienda: 'departamento',
      integrantesFlia: 2,
      hijos: 1,
      hayOtrasMascotas: 0,
      descripcionOtrasMascotas: undefined,
      cubrirGastos: 'Sí',
      darAlimentoCuidados: 'Todos los días',
      darAmorTiempoEj: '3 horas al día',
      devolucionDeMascota: 'La devolvería si es necesario',
      siNoPodesCuidarla: 'La daría en adopción responsable',
      declaracionFinal: 'Me comprometo totalmente',
    };

    it('✅ debería crear una solicitud de adopción correctamente', async () => {
      const solicitudCreada = { id: 'solicitud-id', ...mockDto };

      prismaMock.usuario.findUnique.mockResolvedValue({ id: mockUsuarioId } as any);
      prismaMock.solicitudDeAdopcion.create.mockResolvedValue(solicitudCreada as any);

      const result = await service.crearSolicitud(mockUsuarioId, mockDto);

      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { id: mockUsuarioId } });
      expect(prismaMock.solicitudDeAdopcion.create).toHaveBeenCalledWith({
        data: {
          usuarioId: mockUsuarioId,
          ...mockDto,
        },
      });
      expect(result).toEqual(solicitudCreada);
    });

    it('❌ debería lanzar BadRequest si el usuario no existe', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);

      await expect(service.crearSolicitud(mockUsuarioId, mockDto)).rejects.toThrow(BadRequestException);
      expect(prismaMock.solicitudDeAdopcion.create).not.toHaveBeenCalled();
    });

    it('❌ debería lanzar un error si Prisma falla al crear', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ id: mockUsuarioId } as any);
      prismaMock.solicitudDeAdopcion.create.mockRejectedValue(new Error('DB error'));

      await expect(service.crearSolicitud(mockUsuarioId, mockDto)).rejects.toThrow('DB error');
    });
  });
});
