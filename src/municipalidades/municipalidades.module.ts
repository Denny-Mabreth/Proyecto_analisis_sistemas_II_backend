import { Module } from '@nestjs/common';
import { MunicipalidadesController } from './municipalidades.controller.js';
import { MunicipalidadesService } from './municipalidades.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipalidad } from './entities/municipalidad.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Municipalidad])],
  controllers: [MunicipalidadesController],
  providers: [MunicipalidadesService]
})
export class MunicipalidadesModule {}
