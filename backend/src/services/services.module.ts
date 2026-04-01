import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './service.schema';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }])
  ],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService]
})
export class ServicesModule {}
