import { Test, TestingModule } from '@nestjs/testing';
import { CasosController } from './casos.controller';
import { CasosService } from './casos.service';

describe('CasosController', () => {
  let controller: CasosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasosController],
      providers: [CasosService],
    }).compile();

    controller = module.get<CasosController>(CasosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
