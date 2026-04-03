import { Module } from '@nestjs/common';
import { HospitalizationHandwritingController } from './hospitalization-handwriting.controller';
import { HospitalizationHandwritingService } from './hospitalization-handwriting.service';

@Module({
  controllers: [HospitalizationHandwritingController],
  providers: [HospitalizationHandwritingService],
})
export class HospitalizationHandwritingModule {}
