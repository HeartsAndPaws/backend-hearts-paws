// email-server.service.spec.ts

import { MailerService } from '../email-server.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailerService', () => {
  let service: MailerService;
  let configService: ConfigService;

  const sendMailMock = jest.fn();

  beforeAll(() => {
    // @ts-ignore
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values = {
          MAIL_HOST: 'smtp.test.com',
          MAIL_PORT: 587,
          MAIL_USER: 'user@test.com',
          MAIL_PASS: 'pass123',
        };
        return values[key];
      }),
    } as any;

    service = new MailerService(configService);
    sendMailMock.mockClear();
  });

  describe('enviarEMail', () => {
    it('debería enviar un email con los datos correctos', async () => {
      const options = {
        to: 'destinatario@test.com',
        subject: 'Asunto',
        text: 'Contenido del correo',
      };

      await service.enviarEMail(options);

      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'user@test.com',
        ...options,
      });
    });
  });

  describe('enviarEstadoActualizado', () => {
    it('debería enviar un email de aceptación', async () => {
      await service.enviarEstadoActualizado('ong@test.com', 'ACEPTADA');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ong@test.com',
          subject: expect.stringContaining('Estado'),
          text: expect.stringContaining('aceptada'),
        }),
      );
    });

    it('debería enviar un email de rechazo', async () => {
      await service.enviarEstadoActualizado('ong@test.com', 'RECHAZADA');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ong@test.com',
          subject: expect.stringContaining('Estado'),
          text: expect.stringContaining('rechazada'),
        }),
      );
    });
  });

  describe('enviarConfirmacionRegistro', () => {
    it('debería enviar email de confirmación con el nombre de la organización', async () => {
      await service.enviarConfirmacionRegistro('org@test.com', 'Refugio Esperanza');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'org@test.com',
          text: expect.stringContaining('Refugio Esperanza'),
        }),
      );
    });
  });

  describe('enviarEmailsNotificacionAdopcion', () => {
    it('debería enviar emails al aceptado y rechazados', async () => {
      const todos = ['user1@test.com', 'user2@test.com', 'user3@test.com'];
      const aceptado = 'user2@test.com';
      const mascota = 'Pelusa';

      await service.enviarEmailsNotificacionAdopcion(todos, aceptado, mascota);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: aceptado,
          subject: expect.stringContaining(mascota),
          text: expect.stringContaining('ACEPTADA'),
        }),
      );

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user1@test.com',
          subject: expect.stringContaining(mascota),
          text: expect.stringContaining('RECHAZADA'),
        }),
      );

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user3@test.com',
          subject: expect.stringContaining(mascota),
          text: expect.stringContaining('RECHAZADA'),
        }),
      );
    });
  });
});
