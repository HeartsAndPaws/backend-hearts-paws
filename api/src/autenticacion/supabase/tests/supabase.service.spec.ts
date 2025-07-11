import { UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      }
    };

    service = new SupabaseService(prismaMock);
  });

  describe('registrarOrSync', () => {
    it('debería lanzar UnauthorizedException si falta email o sub', async () => {
      await expect(service.registrarOrSync({ sub: '', email: '' }))
        .rejects.toThrow(UnauthorizedException);

      await expect(service.registrarOrSync({ sub: '123', email: '' }))
        .rejects.toThrow(UnauthorizedException);

      await expect(service.registrarOrSync({ sub: '', email: 'user@test.com' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si el usuario local ya existe sin externalId', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ email: 'user@test.com', externalId: null });

      await expect(service.registrarOrSync({ sub: 'external-123', email: 'user@test.com' }))
        .rejects.toThrow('Este correo ya existe como usuario local');

      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { email: 'user@test.com' } });
    });

    it('debería crear un nuevo usuario si no existe', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        nombre: 'user',
        imagenPerfil: 'picture-url',
        rol: 'USUARIO',
        externalId: 'external-123',
      });

      const result = await service.registrarOrSync({
        sub: 'external-123',
        email: 'user@test.com',
        picture: 'picture-url',
        name: 'user',
      });

      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { email: 'user@test.com' } });
      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'user@test.com',
          nombre: 'user',
          imagenPerfil: 'picture-url',
          rol: 'USUARIO',
          contrasena: null,
          externalId: 'external-123',
        }
      });

      expect(result).toMatchObject({
        id: 'user-1',
        email: 'user@test.com',
        rol: 'USUARIO',
        tipo: 'USUARIO',
        name: 'user',
        picture: 'picture-url',
        external: true,
      });
    });

    it('debería usar parte del email como nombre si no hay name', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue({
        id: 'user-2',
        email: 'user2@test.com',
        nombre: 'user2',
        imagenPerfil: null,
        rol: 'USUARIO',
        externalId: 'external-234',
      });

      const result = await service.registrarOrSync({
        sub: 'external-234',
        email: 'user2@test.com',
      });

      expect(prismaMock.usuario.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          nombre: 'user2',
          imagenPerfil: null,
        })
      }));

      expect(result.name).toBe('user2');
    });

    it('debería actualizar externalId si es distinto', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 'user-3',
        email: 'user3@test.com',
        externalId: 'old-external',
        rol: 'USUARIO',
      });

      prismaMock.usuario.update.mockResolvedValue({
        id: 'user-3',
        email: 'user3@test.com',
        externalId: 'new-external',
        rol: 'USUARIO',
      });

      const result = await service.registrarOrSync({
        sub: 'new-external',
        email: 'user3@test.com',
      });

      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { email: 'user3@test.com' },
        data: { externalId: 'new-external' },
      });

      expect(result.external).toBe(true);
      expect(result.id).toBe('user-3');
    });

    it('debería actualizar rol a USUARIO si es distinto', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 'user-4',
        email: 'user4@test.com',
        externalId: 'external-4',
        rol: 'ADMIN',
      });

      prismaMock.usuario.update.mockResolvedValue({
        id: 'user-4',
        email: 'user4@test.com',
        externalId: 'external-4',
        rol: 'USUARIO',
      });

      // No se actualiza externalId porque es igual, pero sí el rol
      prismaMock.usuario.update.mockResolvedValueOnce({
        id: 'user-4',
        email: 'user4@test.com',
        externalId: 'external-4',
        rol: 'USUARIO',
      });

      const result = await service.registrarOrSync({
        sub: 'external-4',
        email: 'user4@test.com',
      });

      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-4' },
        data: { rol: 'USUARIO' },
      });

      expect(result.rol).toBe('USUARIO');
    });
  });
});