import { Test, TestingModule } from '@nestjs/testing';
import { VitalParametersController } from './vital-parameters.controller';

describe('VitalParametersController', () => {
  let controller: VitalParametersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VitalParametersController],
    }).compile();

    controller = module.get<VitalParametersController>(VitalParametersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
