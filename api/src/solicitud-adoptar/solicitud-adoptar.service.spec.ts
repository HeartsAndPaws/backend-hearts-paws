import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/shared/email/email-server.service';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { EstadoAdopcion, SolicitudDeAdopcion, Usuario } from '@prisma/client';
import { prismaMock } from 'src/test/mocks/prisma.mock';

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
    // mismo contenido que ya tenés
  });

  describe('verCasosAdopcionPorEstado', () => {
    it('debería retornar casos con solicitudes filtradas por estado', async () => {
      prismaMock.casoAdopcion.findMany.mockResolvedValue([{ id: '1', solicitudes: [] }] as any);
      const result = await service.verCasosAdopcionPorEstado(EstadoAdopcion.PENDIENTE);
      expect(prismaMock.casoAdopcion.findMany).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1', solicitudes: [] }]);
    });
  });

  describe('obtenerMascotasConAdopcionPorOng', () => {
    it('debería retornar mascotas con casos de adopción', async () => {
      prismaMock.mascota.findMany.mockResolvedValue([{ id: 'm1' }] as any);
      const result = await service.obtenerMascotasConAdopcionPorOng('ong-123');
      expect(prismaMock.mascota.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          organizacionId: 'ong-123'
        })
      }));
      expect(result).toEqual([{ id: 'm1' }]);
    });
  });

  describe('filtroViviendaQdeMascotas', () => {
    it('debería filtrar solicitudes por tipo de vivienda y ordenar por hayOtrasMascotas', async () => {
      prismaMock.solicitudDeAdopcion.findMany.mockResolvedValue([] as any);
      const result = await service.filtroViviendaQdeMascotas('caso-1', 'casa');
      expect(prismaMock.solicitudDeAdopcion.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          casoAdopcionId: 'caso-1',
          tipoVivienda: 'casa'
        }
      }));
      expect(result).toEqual([]);
    });
  });

  describe('verSolicitudesPorCasoDeAdopcion', () => {
    it('debería retornar mascotas con sus solicitudes de adopción', async () => {
      prismaMock.mascota.findMany.mockResolvedValue([
        {
          id: 'm1',
          nombre: 'Luna',
          edad: 2,
          descripcion: 'Tierna',
          imagenes: [],
          casos: [
            {
              adopcion: {
                solicitudes: [
                  {
                    id: 'sol1',
                    estado: 'PENDIENTE',
                    tipoVivienda: 'casa',
                    integrantesFlia: 3,
                    hijos: 1,
                    hayOtrasMascotas: 0,
                    descripcionOtrasMascotas: null,
                    cubrirGastos: 'sí',
                    darAlimentoCuidados: 'diario',
                    darAmorTiempoEj: '2h',
                    devolucionDeMascota: 'no',
                    siNoPodesCuidarla: 'buscaría ayuda',
                    declaracionFinal: 'acepto',
                    usuario: {
                      id: 'u1',
                      nombre: 'Juan',
                      email: 'juan@mail.com',
                      telefono: '123',
                      direccion: 'calle 1',
                      ciudad: 'ciudad',
                      pais: 'país',
                      imagenPerfil: 'foto.jpg'
                    }
                  }
                ]
              }
            }
          ]
        }
      ] as any);

      const result = await service.verSolicitudesPorCasoDeAdopcion('ong-1');
      expect(result).toHaveLength(1);
      expect(result[0].mascota.nombre).toBe('Luna');
    });
  });

  describe('aceptarSolicitud', () => {
    it('debería lanzar UnauthorizedException si ongId no coincide', async () => {
      prismaMock.casoAdopcion.findUnique.mockResolvedValue({
        caso: { ongId: 'otra-ong' }
      } as any);

      await expect(
        service.aceptarSolicitud('caso-1', 'sol-1', EstadoAdopcion.ACEPTADA, 'mi-ong')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar BadRequest si estadoNuevo no es ACEPTADA', async () => {
      prismaMock.casoAdopcion.findUnique.mockResolvedValue({
        caso: { ongId: 'mi-ong' }
      } as any);

      await expect(
        service.aceptarSolicitud('caso-1', 'sol-1', EstadoAdopcion.RECHAZADA, 'mi-ong')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFound si la solicitud no existe', async () => {
      prismaMock.casoAdopcion.findUnique.mockResolvedValue({
        caso: { ongId: 'mi-ong' }
      } as any);

      prismaMock.solicitudDeAdopcion.findUnique.mockResolvedValue(null);

      await expect(
        service.aceptarSolicitud('caso-1', 'sol-1', EstadoAdopcion.ACEPTADA, 'mi-ong')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequest si la solicitud no está pendiente', async () => {
      prismaMock.casoAdopcion.findUnique.mockResolvedValue({
        caso: { ongId: 'mi-ong' }
      } as any);

      prismaMock.solicitudDeAdopcion.findUnique.mockResolvedValue(
        {
  id: 'solicitud-id',
  estado: 'RECHAZADA',
  usuarioId: 'usuario-id',
  casoAdopcionId: 'caso-id',
  tipoVivienda: 'departamento',
  integrantesFlia: 2,
  hijos: 1,
  hayOtrasMascotas: 0,
  descripcionOtrasMascotas: null,
  cubrirGastos: 'Sí',
  darAlimentoCuidados: 'Todos los días',
  darAmorTiempoEj: '3 horas al día',
  devolucionDeMascota: 'La devolvería si es necesario',
  siNoPodesCuidarla: 'La daría en adopción responsable',
  declaracionFinal: 'Me comprometo totalmente',
})

      await expect(
        service.aceptarSolicitud('caso-1', 'sol-1', EstadoAdopcion.ACEPTADA, 'mi-ong')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería ejecutar flujo de aceptación correctamente', async () => {
      prismaMock.casoAdopcion.findUnique.mockResolvedValue({
        caso: { ongId: 'mi-ong', mascotaId: 'mascota-1' }
      } as any);

      prismaMock.solicitudDeAdopcion.findUnique.mockResolvedValue({
  id: 'solicitud-id',
  usuarioId: 'usuario-id',
  casoAdopcionId: 'caso-id',
  estado: 'PENDIENTE',
  tipoVivienda: 'departamento',
  integrantesFlia: 2,
  hijos: 1,
  hayOtrasMascotas: 0,
  descripcionOtrasMascotas: null,
  cubrirGastos: 'Sí',
  darAlimentoCuidados: 'Todos los días',
  darAmorTiempoEj: '3 horas al día',
  devolucionDeMascota: 'La devolvería si es necesario',
  siNoPodesCuidarla: 'La daría en adopción responsable',
  declaracionFinal: 'Me comprometo totalmente',
});

  prismaMock.solicitudDeAdopcion.findMany.mockResolvedValue([
  {
    id: 'sol-1',
    usuarioId: 'user-1',
    casoAdopcionId: 'caso-1',
    estado: 'PENDIENTE',
    tipoVivienda: 'departamento',
    integrantesFlia: 2,
    hijos: 1,
    hayOtrasMascotas: 0,
    descripcionOtrasMascotas: null,
    cubrirGastos: 'Sí',
    darAlimentoCuidados: 'Todos los días',
    darAmorTiempoEj: '3 horas',
    devolucionDeMascota: 'Sí',
    siNoPodesCuidarla: 'Se la daría a un conocido',
    declaracionFinal: 'Me comprometo',
    usuario: {
      id: 'user-1',
      nombre: 'Alex',
      email: 'a@a.com',
      telefono: '111',
      direccion: 'Calle 1',
      ciudad: 'Ciudad X',
      pais: 'País',
      imagenPerfil: null,
    } as Usuario,
  } as SolicitudDeAdopcion & { usuario: Usuario },
  {
    id: 'sol-2',
    usuarioId: 'user-2',
    casoAdopcionId: 'caso-1',
    estado: 'PENDIENTE',
    tipoVivienda: 'casa',
    integrantesFlia: 4,
    hijos: 2,
    hayOtrasMascotas: 1,
    descripcionOtrasMascotas: 'Un gato',
    cubrirGastos: 'Sí',
    darAlimentoCuidados: '2 veces al día',
    darAmorTiempoEj: '1 hora',
    devolucionDeMascota: 'No',
    siNoPodesCuidarla: 'Buscaría una nueva familia',
    declaracionFinal: 'Comprometido',
    usuario: {
      id: 'user-2',
      nombre: 'Bruno',
      email: 'b@b.com',
      telefono: '222',
      direccion: 'Calle 2',
      ciudad: 'Ciudad Y',
      pais: 'País',
      imagenPerfil: null,
    } as Usuario,
  } as SolicitudDeAdopcion & { usuario: Usuario },
]);

      prismaMock.mascota.findUnique.mockResolvedValue({
  id: 'mascota-1',
  nombre: 'Firulais',
  organizacionId: 'ong-1',
  descripcion: 'Juguetón',
  edad: 2,
  creada_en: new Date(),
  tipoId: 'tipo-1',
});


      const result = await service.aceptarSolicitud('caso-1', 'sol-1', EstadoAdopcion.ACEPTADA, 'mi-ong');
      expect(mockMailerService.enviarEmailsNotificacionAdopcion).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Solicitud aceptada correctamente y otras rechazadas.' });
    });
  });

  describe('borrarSolicitud', () => {
    it('debería borrar la solicitud correctamente', async () => {
      prismaMock.solicitudDeAdopcion.findUnique.mockResolvedValue({
  id: 'solicitud-1',
  usuarioId: 'usuario-1',
  casoAdopcionId: 'caso-1',
  estado: 'PENDIENTE',
  tipoVivienda: 'departamento',
  integrantesFlia: 2,
  hijos: 0,
  hayOtrasMascotas: 1,
  descripcionOtrasMascotas: 'Un gato',
  cubrirGastos: 'Sí',
  darAlimentoCuidados: 'Todos los días',
  darAmorTiempoEj: '3 horas al día',
  devolucionDeMascota: 'Solo si es necesario',
  siNoPodesCuidarla: 'La daría en adopción responsable',
  declaracionFinal: 'Me comprometo totalmente',
});

      const result = await service.borrarSolicitud('sol-1');
      expect(prismaMock.solicitudDeAdopcion.delete).toHaveBeenCalledWith({ where: { id: 'sol-1' } });
      expect(result).toEqual({ mensaje: 'Solicitud borrada id: sol-1' });
    });
  });

  describe('contarAdopcionesAceptadas', () => {
    it('debería contar los casos de adopción aceptados', async () => {
      prismaMock.casoAdopcion.count.mockResolvedValue(5);
      const result = await service.contarAdopcionesAceptadas();
      expect(result).toEqual({ total: 5 });
    });
  });

  describe('existenciaDeSolicitud', () => {
    it('debería retornar true si existe solicitud', async () => {
      prismaMock.solicitudDeAdopcion.findFirst.mockResolvedValue({
          id: 'solicitud-1',
  usuarioId: 'usuario-1',
  casoAdopcionId: 'caso-1',
  estado: 'PENDIENTE',
  tipoVivienda: 'departamento',
  integrantesFlia: 2,
  hijos: 0,
  hayOtrasMascotas: 1,
  descripcionOtrasMascotas: 'Un gato',
  cubrirGastos: 'Sí',
  darAlimentoCuidados: 'Todos los días',
  darAmorTiempoEj: '3 horas al día',
  devolucionDeMascota: 'Solo si es necesario',
  siNoPodesCuidarla: 'La daría en adopción responsable',
  declaracionFinal: 'Me comprometo totalmente',
      });
      const result = await service.existenciaDeSolicitud('u1', 'caso-1');
      expect(result).toBe(true);
    });

    it('debería retornar false si no existe solicitud', async () => {
      prismaMock.solicitudDeAdopcion.findFirst.mockResolvedValue(null);
      const result = await service.existenciaDeSolicitud('u1', 'caso-1');
      expect(result).toBe(false);
    });
  });
});
