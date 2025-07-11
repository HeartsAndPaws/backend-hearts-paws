import { stripe } from "../stripe.service";
import { StripeService } from '../stripe.service';
import { BadRequestException } from "@nestjs/common";

describe('StripeService', () => {
  let service: StripeService;

  beforeAll(() => {
    service = new StripeService();
  });

  describe('crearCheckoutSession', () => {
    let createMock: jest.Mock;

    beforeAll(() => {
      // Creamos el mock directamente sobre el método create
      createMock = jest.fn().mockResolvedValue({
        url: 'https://mocked-checkout.url',
      });

      // Reemplazamos el método en el objeto stripe
      (stripe.checkout.sessions as any).create = createMock;
    });

    afterAll(() => {
      // Restauramos el mock al estado original si fuera necesario
      jest.restoreAllMocks();
    });

    it('debería crear una sesión de checkout y devolver la url', async () => {
      const url = await service.crearCheckoutSession(
        1000,
        'casoId-123',
        'usuarioId-123',
        'organizacionId-123',
        'mascotaId-123',
        'Titulo de prueba',
        'Descripción de prueba',
      );

      expect(url).toBe('https://mocked-checkout.url');
      expect(createMock).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el monto en USD es menor a 0.50', async () => {
      const montoMuyBajo = 10; // en ARS, da < 0.50 USD
      await expect(
        service.crearCheckoutSession(
          montoMuyBajo,
          'casoId-123',
          'usuarioId-123',
          'organizacionId-123',
          'mascotaId-123',
          'Titulo',
          'Descripción',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
