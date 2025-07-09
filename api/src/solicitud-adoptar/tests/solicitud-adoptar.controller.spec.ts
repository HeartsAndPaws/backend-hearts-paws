import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdoptarController } from './solicitud-adoptar.controller';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';

describe('SolicitudAdoptarController', () => {
  let controller: SolicitudAdoptarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudAdoptarController],
      providers: [SolicitudAdoptarService],
    }).compile();

    controller = module.get<SolicitudAdoptarController>(SolicitudAdoptarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
