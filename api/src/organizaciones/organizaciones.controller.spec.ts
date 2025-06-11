import { Test, TestingModule } from '@nestjs/testing';
import { OrganizacionesController } from './organizaciones.controller';
import { OrganizacionesService } from './organizaciones.service';

describe('OrganizacionesController', () => {
  let controller: OrganizacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizacionesController],
      providers: [OrganizacionesService],
    }).compile();

    controller = module.get<OrganizacionesController>(OrganizacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
