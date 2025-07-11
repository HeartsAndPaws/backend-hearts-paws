import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany();
    await prisma.organizacion.deleteMany();
    await app.close();
  });

  describe('/auth/registro (POST)', () => {
    it('debería registrar un usuario', async () => {
      const res = await api()
        .post('/auth/registro')
        .field('nombre', 'Carlos Pérez')
        .field('email', 'usuario123@email.com')
        .field('contrasena', 'ClaveSegura#2024')
        .field('telefono', '3001234567')
        .field('direccion', 'Calle 45 #67-89, Apto 302')
        .field('ciudad', 'Medellín')
        .field('pais', 'Colombia')
        .expect(201);

      expect(res.body.ok).toBe(true);
      expect(res.body.usuario.email).toBe('usuario123@email.com');
    });
  });

  describe('/auth/ingreso (POST)', () => {
    it('debería loguear al usuario y devolver cookie', async () => {
      const res = await api()
        .post('/auth/ingreso')
        .send({ email: 'usuario123@email.com', contrasena: 'ClaveSegura#2024' })
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.headers['set-cookie'][0]).toContain('authToken');
    });
  });

  describe('/auth/cerrarSesion (POST)', () => {
    it('debería borrar la cookie authToken', async () => {
      const res = await api().post('/auth/cerrarSesion').expect(200);
      expect(res.body.ok).toBe(true);
      expect(res.headers['set-cookie'][0]).toContain('authToken=');
    });
  });

  describe('/auth/registro-ong (POST)', () => {
    it('debería registrar una organización', async () => {
      const res = await api()
        .post('/auth/registro-ong')
        .field('nombre', 'Refugio Animal')
        .field('email', 'refugio@email.com')
        .field('contrasena', 'OrgSecure#2024')
        .field('descripcion', 'Refugio de animales')
        .field('telefono', '3204567890')
        .field('direccion', 'Calle 123')
        .field('ciudad', 'Bogotá')
        .field('pais', 'Colombia')
        .attach('archivoVerificacionUrl', Buffer.from('PDF-DUMMY'), {
          filename: 'verificacion.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);

      expect(res.body.ok).toBe(true);
      expect(res.body.organizacion.email).toBe('refugio@email.com');
    });
  });

  describe('/auth/organizaciones/ingreso (POST)', () => {
    beforeAll(async () => {
      await prisma.organizacion.update({
        where: { email: 'refugio@email.com' },
        data: { estado: 'APROBADA' },
      });
    });

    it('debería loguear a la organización y devolver cookie', async () => {
      const res = await api()
        .post('/auth/organizaciones/ingreso')
        .send({ email: 'refugio@email.com', contrasena: 'OrgSecure#2024' })
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.body.organizacion.nombre).toBe('Refugio Animal');
      expect(res.headers['set-cookie'][0]).toContain('authToken');
    });
  });
});
