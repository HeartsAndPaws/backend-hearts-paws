import { Test, TestingModule } from '@nestjs/testing';
import { ServicioAut } from '../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/shared/email/email-server.service';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('ServicioAut', () => {
  let service: ServicioAut;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioAut,
        {
          provide: PrismaService,
          useValue: {
            usuario: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            organizacion: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            enviarConfirmacionRegistro: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServicioAut>(ServicioAut);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
  });

  describe('registro', () => {
    it('debería registrar un nuevo usuario si el email no existe', async () => {
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.usuario.create as jest.Mock).mockResolvedValue({
        id: '1',
        nombre: 'Juan',
        email: 'juan@correo.com',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: '',
        imagenPerfil: '',
        rol: 'USUARIO',
      });

      const result = await service.registro({
            nombre: 'Juan',
            email: 'juan@correo.com',
            contrasena: '12345678',
            telefono: '123456789',
            direccion: 'Calle Falsa 123',
            ciudad: 'Ciudad',
            pais: 'País',
      });

      expect(result.ok).toBe(true);
      expect(result.usuario.email).toBe('juan@correo.com');
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(
        service.registro({
            nombre: 'Juan',
            email: 'juan@correo.com',
            contrasena: '12345678',
            telefono: '123456789',
            direccion: 'Calle Falsa 123',
            ciudad: 'Ciudad',
            pais: 'País',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('ingreso', () => {
    it('debería loguear correctamente al usuario', async () => {
      const usuario = {
        id: '1',
        email: 'juan@correo.com',
        contrasena: await bcrypt.hash('12345678', 10),
        nombre: 'Juan',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: '',
        imagenPerfil: '',
        rol: 'USUARIO',
      };
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(usuario);

      const result = await service.ingreso('juan@correo.com', '12345678');

      expect(result.ok).toBeDefined();
      expect(result.token).toBe('mocked-jwt-token');
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.ingreso('no@existe.com', '12345678')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const usuario = {
        id: '1',
        email: 'juan@correo.com',
        contrasena: await bcrypt.hash('12345678', 10),
      };
      (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(usuario);

      await expect(
        service.ingreso('juan@correo.com', 'wrongpass')
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});