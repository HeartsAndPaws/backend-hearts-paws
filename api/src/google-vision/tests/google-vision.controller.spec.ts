import { Test, TestingModule } from '@nestjs/testing';
import { GoogleVisionController } from './google-vision.controller';
import { GoogleVisionService } from './google-vision.service';

describe('GoogleVisionController', () => {
  let controller: GoogleVisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleVisionController],
      providers: [GoogleVisionService],
    }).compile();

    controller = module.get<GoogleVisionController>(GoogleVisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
