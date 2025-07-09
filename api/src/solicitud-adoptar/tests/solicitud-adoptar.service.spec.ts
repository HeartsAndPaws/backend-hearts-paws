import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';

describe('SolicitudAdoptarService', () => {
  let service: SolicitudAdoptarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudAdoptarService],
    }).compile();

    service = module.get<SolicitudAdoptarService>(SolicitudAdoptarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
