import { stripe } from "../stripe.service";
import { StripeService } from '../stripe.service';

describe('StripeService', () => {
  let service: StripeService;
  let stripeCreateMock: jest.SpyInstance;

  beforeAll(() => {
    service = new StripeService();
  });

  describe('crearCheckoutSession', () => {
    beforeAll(() => {
      stripeCreateMock = jest.spyOn(stripe.checkout.sessions, 'create').mockResolvedValue({
        url: 'https://mocked-checkout.url',
      } as any);
    });

    afterAll(() => {
      stripeCreateMock.mockRestore();
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
      expect(stripeCreateMock).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el monto en USD es menor a 0.50', async () => {
      const montoMuyBajo = 10; // Monto muy bajo para lanzar excepción
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
      ).rejects.toThrow('El monto en USD debe ser al menos $0.50.');
    });
  });
});
